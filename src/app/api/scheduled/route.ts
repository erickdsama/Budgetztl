import { NextResponse } from "next/server";
import { getScheduledTransactions } from "@/app/settings/scheduled/actions";

export async function GET() {
  const result = await getScheduledTransactions();
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json(result, {
    headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" },
  });
}
