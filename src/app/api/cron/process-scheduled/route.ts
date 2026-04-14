import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Vercel Cron Job — runs daily at 06:00 UTC (vercel.json)
 *
 * Processes all active scheduled_transactions whose next_due_date <= today:
 *   1. Creates a real transaction record
 *   2. Advances next_due_date by the frequency interval
 *   3. Deactivates the schedule if end_date has passed
 *
 * Protected by CRON_SECRET env var — Vercel sends it as Authorization: Bearer <secret>
 */
export async function GET(request: NextRequest) {
  // Verify the request comes from Vercel's cron scheduler
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service role key — cron runs without a user session, needs to bypass RLS
  const supabase = createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get today's date in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Fetch all overdue active scheduled transactions
  const { data: due, error: fetchError } = await supabase
    .from("scheduled_transactions")
    .select("*")
    .eq("is_active", true)
    .lte("next_due_date", today);

  if (fetchError) {
    console.error("[cron] fetch error:", fetchError.message);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ processed: 0, message: "No due transactions" });
  }

  let processed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const sched of due) {
    try {
      // 1. Create the real transaction
      const { error: txError } = await supabase.from("transactions").insert({
        budget_id: sched.budget_id,
        user_id: sched.user_id,
        category_id: sched.category_id,
        type: sched.type,
        amount: sched.amount,
        description: sched.description ?? `Scheduled: ${sched.frequency}`,
        date: sched.next_due_date, // use the scheduled date, not today
      });

      if (txError) {
        errors.push(`${sched.id}: ${txError.message}`);
        continue;
      }

      // 2. Calculate the next due date
      const nextDue = advanceDate(sched.next_due_date, sched.frequency);

      // 3. Check if we should deactivate (end_date reached)
      const shouldDeactivate =
        sched.end_date !== null && nextDue > sched.end_date;

      // 4. Update the schedule
      const { error: updateError } = await supabase
        .from("scheduled_transactions")
        .update({
          next_due_date: nextDue,
          is_active: !shouldDeactivate,
        })
        .eq("id", sched.id);

      if (updateError) {
        errors.push(`${sched.id} update: ${updateError.message}`);
        continue;
      }

      processed++;
    } catch (err) {
      errors.push(`${sched.id}: ${String(err)}`);
      skipped++;
    }
  }

  console.log(
    `[cron] processed=${processed} skipped=${skipped} errors=${errors.length}`
  );

  return NextResponse.json({
    processed,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
    date: today,
  });
}

/**
 * Advance a YYYY-MM-DD date string by one frequency interval.
 * Uses the same day-of-month as the original date where possible.
 */
function advanceDate(
  dateStr: string,
  frequency: "weekly" | "monthly" | "yearly"
): string {
  const d = new Date(dateStr + "T00:00:00Z");

  switch (frequency) {
    case "weekly":
      d.setUTCDate(d.getUTCDate() + 7);
      break;
    case "monthly":
      d.setUTCMonth(d.getUTCMonth() + 1);
      break;
    case "yearly":
      d.setUTCFullYear(d.getUTCFullYear() + 1);
      break;
  }

  return d.toISOString().split("T")[0];
}
