import { NextResponse } from "next/server";
import { getCategoriesWithSpent } from "@/app/categories/actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") ?? "expense") as "expense" | "income";
  const result = await getCategoriesWithSpent(type);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json(result.categories, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
    },
  });
}
