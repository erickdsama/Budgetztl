import { NextResponse } from "next/server";
import { getSettingsData } from "@/app/settings/actions";

export async function GET() {
  const result = await getSettingsData();
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result.data, {
    headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=120" },
  });
}
