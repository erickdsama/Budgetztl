import { NextResponse } from "next/server";
import { createClient, getAuthUserBudget } from "@/lib/supabase/server";

export async function GET() {
  const authResult = await getAuthUserBudget();
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const { budgetId, userId } = authResult;
  const supabase = await createClient();

  const [budgetResult, expenseCatsResult, incomeCatsResult, profileResult] =
    await Promise.all([
      supabase.from("budgets").select("currency").eq("id", budgetId).single(),
      supabase
        .from("categories")
        .select("*")
        .eq("budget_id", budgetId)
        .eq("transaction_type", "expense")
        .order("sort_order", { ascending: true }),
      supabase
        .from("categories")
        .select("*")
        .eq("budget_id", budgetId)
        .eq("transaction_type", "income")
        .order("sort_order", { ascending: true }),
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", userId)
        .single(),
    ]);

  const currency = budgetResult.data?.currency ?? "USD";
  const capturedBy = profileResult.data
    ? {
        name: profileResult.data.full_name,
        avatarUrl: profileResult.data.avatar_url,
      }
    : { name: "You", avatarUrl: null };

  return NextResponse.json(
    {
      currency,
      expenseCategories: expenseCatsResult.data ?? [],
      incomeCategories: incomeCatsResult.data ?? [],
      capturedBy,
    },
    {
      headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" },
    }
  );
}
