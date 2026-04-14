"use server";

import { createClient, getAuthUserBudget } from "@/lib/supabase/server";

export type MonthStatus = "under_budget" | "over_budget" | "on_track";

export type TopCategory = {
  name: string;
  icon: string;
  amount: number;
};

export type MonthData = {
  year: number;
  month: number;
  spent: number;
  budgeted: number;
  status: MonthStatus;
  topCategories: TopCategory[];
};

export type HistoricalData = {
  lifetimeSavings: number;
  efficiencyScore: number;
  months: MonthData[];
  currency: string;
  error?: string;
};

function computeStatus(spent: number, budgeted: number): MonthStatus {
  if (budgeted <= 0) {
    return spent > 0 ? "over_budget" : "on_track";
  }
  const ratio = spent / budgeted;
  if (ratio > 1) return "over_budget";
  if (ratio >= 0.9) return "on_track";
  return "under_budget";
}

export async function getHistoricalData(params: {
  year: number;
}): Promise<HistoricalData> {
  const result = await getAuthUserBudget();
  if (!result.ok) {
    return {
      lifetimeSavings: 0,
      efficiencyScore: 0,
      months: [],
      currency: "USD",
      error: result.error,
    };
  }

  const { budgetId } = result;
  const supabase = await createClient();

  // Get budget currency
  const { data: budget } = await supabase
    .from("budgets")
    .select("currency")
    .eq("id", budgetId)
    .single();

  const currency = budget?.currency ?? "USD";

  // Get ALL transactions for this budget (lifetime savings calculation)
  const { data: allTransactions, error: txError } = await supabase
    .from("transactions")
    .select("type, amount, date")
    .eq("budget_id", budgetId);

  if (txError || !allTransactions) {
    return {
      lifetimeSavings: 0,
      efficiencyScore: 0,
      months: [],
      currency,
      error: txError?.message ?? "Failed to load transactions.",
    };
  }

  // Calculate lifetime savings: total income - total expenses
  let totalIncome = 0;
  let totalExpenses = 0;
  for (const tx of allTransactions) {
    if (tx.type === "income") {
      totalIncome += Number(tx.amount);
    } else if (tx.type === "expense") {
      totalExpenses += Number(tx.amount);
    }
  }
  const lifetimeSavings = totalIncome - totalExpenses;

  // Get expense categories only — income categories must not inflate the budgeted total
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, icon, monthly_budget")
    .eq("budget_id", budgetId)
    .eq("transaction_type", "expense");

  const categoryMap = new Map(
    (categories ?? []).map((c) => [c.id, c])
  );

  // Total monthly budget = sum of expense category budgets only
  const totalMonthlyBudget = (categories ?? []).reduce(
    (sum, c) => sum + Number(c.monthly_budget),
    0
  );

  // Group all transactions by year-month for efficiency score
  const monthlyData = new Map<
    string,
    { spent: number; year: number; month: number }
  >();

  for (const tx of allTransactions) {
    if (tx.type !== "expense") continue;
    const parts = tx.date.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const key = `${y}-${m}`;
    const existing = monthlyData.get(key);
    if (existing) {
      existing.spent += Number(tx.amount);
    } else {
      monthlyData.set(key, { spent: Number(tx.amount), year: y, month: m });
    }
  }

  // Calculate efficiency score: months under budget / total months
  const totalMonths = monthlyData.size;
  let monthsUnderBudget = 0;
  for (const data of monthlyData.values()) {
    if (data.spent <= totalMonthlyBudget) {
      monthsUnderBudget++;
    }
  }
  const efficiencyScore =
    totalMonths > 0 ? Math.round((monthsUnderBudget / totalMonths) * 100) : 0;

  // Fetch year's transactions with category_id for monthly breakdown
  const startDate = `${params.year}-01-01`;
  const endDate = `${params.year + 1}-01-01`;

  const { data: yearTxDetailed } = await supabase
    .from("transactions")
    .select("amount, date, category_id")
    .eq("budget_id", budgetId)
    .eq("type", "expense")
    .gte("date", startDate)
    .lt("date", endDate);

  // Build proper monthly breakdown with category detail
  const detailedMonthMap = new Map<
    number,
    { spent: number; categorySpending: Map<string, number> }
  >();

  for (const tx of yearTxDetailed ?? []) {
    const m = parseInt(tx.date.split("-")[1], 10);
    const existing = detailedMonthMap.get(m);
    const amount = Number(tx.amount);

    if (existing) {
      existing.spent += amount;
      const prev = existing.categorySpending.get(tx.category_id) ?? 0;
      existing.categorySpending.set(tx.category_id, prev + amount);
    } else {
      const catMap = new Map<string, number>();
      catMap.set(tx.category_id, amount);
      detailedMonthMap.set(m, { spent: amount, categorySpending: catMap });
    }
  }

  // Build months array (reverse chronological)
  const months: MonthData[] = [];
  // Include all months that have data for the selected year
  const sortedMonths = Array.from(detailedMonthMap.keys()).sort(
    (a, b) => b - a
  );

  for (const m of sortedMonths) {
    const data = detailedMonthMap.get(m);
    if (!data) continue;

    // Top 3 categories by spending
    const categoryEntries = Array.from(data.categorySpending.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topCategories: TopCategory[] = categoryEntries.map(
      ([catId, amount]) => {
        const cat = categoryMap.get(catId);
        return {
          name: cat?.name ?? "Unknown",
          icon: cat?.icon ?? "more_horiz",
          amount,
        };
      }
    );

    months.push({
      year: params.year,
      month: m,
      spent: data.spent,
      budgeted: totalMonthlyBudget,
      status: computeStatus(data.spent, totalMonthlyBudget),
      topCategories,
    });
  }

  return {
    lifetimeSavings,
    efficiencyScore,
    months,
    currency,
  };
}

export async function getAvailableYears(): Promise<{
  years: number[];
  error?: string;
}> {
  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { years: [], error: result.error };
  }

  const { budgetId } = result;
  const supabase = await createClient();

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("date")
    .eq("budget_id", budgetId);

  if (error) {
    return { years: [], error: error.message };
  }

  const yearSet = new Set<number>();
  for (const tx of transactions ?? []) {
    const year = parseInt(tx.date.split("-")[0], 10);
    if (!isNaN(year)) {
      yearSet.add(year);
    }
  }

  const years = Array.from(yearSet).sort((a, b) => b - a);
  return { years };
}
