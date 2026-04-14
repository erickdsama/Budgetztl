import { NextResponse } from "next/server";
import { getDashboardData } from "@/app/dashboard/actions";

export async function GET() {
  const result = await getDashboardData();
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.redirect ? 401 : 500 }
    );
  }
  return NextResponse.json(result.data, {
    headers: {
      "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
    },
  });
}
