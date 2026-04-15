import { NextResponse, type NextRequest } from "next/server";
import { getAuthUserBudget, createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const cursor = searchParams.get("cursor");

  const result = await getAuthUserBudget();
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 401 });

  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select("id, type, amount, description, date, category_id, user_id, created_at")
    .eq("budget_id", result.budgetId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const [{ data: categories }, { data: members }] = await Promise.all([
    supabase.from("categories").select("id, name, icon").eq("budget_id", result.budgetId),
    supabase
      .from("budget_members")
      .select("user_id, profiles(full_name, avatar_url)")
      .eq("budget_id", result.budgetId),
  ]);

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c]));
  const memberMap = new Map(
    (members ?? []).map((m) => {
      const profile = m.profiles as { full_name: string; avatar_url: string | null } | null;
      return [
        m.user_id,
        { fullName: profile?.full_name ?? "User", avatarUrl: profile?.avatar_url ?? null },
      ];
    })
  );

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1].created_at : null;

  const enriched = items.map((tx) => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    date: tx.date,
    createdAt: tx.created_at,
    category: categoryMap.get(tx.category_id) ?? {
      id: tx.category_id,
      name: "Unknown",
      icon: "more_horiz",
    },
    user: memberMap.get(tx.user_id) ?? { fullName: "User", avatarUrl: null },
  }));

  return NextResponse.json({ items: enriched, nextCursor, hasMore }, {
    headers: { "Cache-Control": "private, no-cache" },
  });
}
