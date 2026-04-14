import { NextResponse } from "next/server";
import { getHistoricalData } from "@/app/history/actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(
    searchParams.get("year") ?? String(new Date().getFullYear()),
    10
  );
  const data = await getHistoricalData({ year });
  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 500 });
  }
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
    },
  });
}
