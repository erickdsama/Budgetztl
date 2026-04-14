"use server";

import { createClient, getAuthUserBudget } from "@/lib/supabase/server";

export type DashboardCategory = {
  id: string;
  name: string;
  icon: string;
  spent: number;
  budgeted: number;
  percentage: number;
};

export type DashboardTransaction = {
  id: string;
  description: string | null;
  amount: number;
  type: string;
  date: string;
  category: { name: string; icon: string };
  user: { fullName: string; avatarUrl: string | null };
};

export type DashboardData = {
  budget: {
    name: string;
    currency: string;
    totalBudgeted: number;
  };
  members: Array<{
    fullName: string;
    avatarUrl: string | null;
  }>;
  monthlySpending: {
    spent: number;
    remaining: number;
    percentage: number;
  };
  topCategories: DashboardCategory[];
  recentTransactions: DashboardTransaction[];
};

export type DashboardResult =
  | { ok: true; data: DashboardData }
  | { ok: false; error: string; redirect?: string };

export async function getDashboardData(): Promise<DashboardResult> {
  // 1. Check auth + budget membership (cached — no duplicate network calls)
  const authResult = await getAuthUserBudget();
  if (!authResult.ok) {
    if (authResult.error === "Not authenticated") {
      return { ok: false, error: "Not authenticated", redirect: "/login" };
    }
    return { ok: false, error: "No budget found", redirect: "/onboarding" };
  }

  const { budgetId } = authResult;
  const supabase = await createClient();

  // 3. Compute current month date range
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  // 4. Run parallel queries
  const [budgetResult, membersResult, categoriesResult, transactionsResult, recentResult] =
    await Promise.all([
      // Budget info
      supabase
        .from("budgets")
        .select("name, currency")
        .eq("id", budgetId)
        .single(),

      // Budget members with profiles
      supabase
        .from("budget_members")
        .select("user_id, profiles(full_name, avatar_url)")
        .eq("budget_id", budgetId),

      // Expense categories only — totalBudgeted must not include income categories
      supabase
        .from("categories")
        .select("id, name, icon, monthly_budget")
        .eq("budget_id", budgetId)
        .eq("transaction_type", "expense")
        .order("sort_order", { ascending: true }),

      // All expense transactions this month
      supabase
        .from("transactions")
        .select("category_id, amount")
        .eq("budget_id", budgetId)
        .eq("type", "expense")
        .gte("date", startDate)
        .lt("date", endDate),

      // Last 3 transactions (any type)
      supabase
        .from("transactions")
        .select("id, description, amount, type, date, category_id, user_id")
        .eq("budget_id", budgetId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  if (budgetResult.error || !budgetResult.data) {
    return { ok: false, error: "Failed to load budget data." };
  }

  const budget = budgetResult.data;
  const categories = categoriesResult.data ?? [];
  const monthlyTransactions = transactionsResult.data ?? [];
  const recentRows = recentResult.data ?? [];

  // 5. Calculate total budgeted from sum of all category monthly_budgets
  const totalBudgeted = categories.reduce(
    (sum, cat) => sum + (cat.monthly_budget ?? 0),
    0
  );

  // 6. Calculate total monthly spending
  const totalSpent = monthlyTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const remaining = Math.max(totalBudgeted - totalSpent, 0);
  const percentage =
    totalBudgeted > 0 ? Math.min(Math.round((totalSpent / totalBudgeted) * 100), 100) : 0;

  // 7. Calculate spending per category, then get top 3
  const spendingByCategory: Record<string, number> = {};
  for (const t of monthlyTransactions) {
    spendingByCategory[t.category_id] =
      (spendingByCategory[t.category_id] ?? 0) + t.amount;
  }

  const categoryData: DashboardCategory[] = categories
    .map((cat) => {
      const spent = spendingByCategory[cat.id] ?? 0;
      const catBudgeted = cat.monthly_budget ?? 0;
      const catPercentage =
        catBudgeted > 0 ? Math.min(Math.round((spent / catBudgeted) * 100), 100) : 0;
      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        spent,
        budgeted: catBudgeted,
        percentage: catPercentage,
      };
    })
    .filter((cat) => cat.spent > 0 || cat.budgeted > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  // 8. Build members list
  const members = (membersResult.data ?? []).map((m) => {
    const profile = m.profiles as unknown as {
      full_name: string;
      avatar_url: string | null;
    } | null;
    return {
      fullName: profile?.full_name ?? "User",
      avatarUrl: profile?.avatar_url ?? null,
    };
  });

  // 9. Enrich recent transactions with category and user info
  // Build lookup maps
  const categoryMap = new Map(
    categories.map((c) => [c.id, { name: c.name, icon: c.icon }])
  );
  const memberMap = new Map(
    members.map((m, _i) => {
      // We need the user_id for lookup - get it from membersResult
      const memberRow = (membersResult.data ?? [])[_i];
      return [memberRow?.user_id ?? "", m];
    })
  );

  const recentTransactions: DashboardTransaction[] = recentRows.map((t) => {
    const cat = categoryMap.get(t.category_id) ?? {
      name: "Unknown",
      icon: "more_horiz",
    };
    const usr = memberMap.get(t.user_id) ?? {
      fullName: "User",
      avatarUrl: null,
    };
    return {
      id: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      date: t.date,
      category: cat,
      user: { fullName: usr.fullName, avatarUrl: usr.avatarUrl },
    };
  });

  return {
    ok: true,
    data: {
      budget: {
        name: budget.name,
        currency: budget.currency,
        totalBudgeted,
      },
      members,
      monthlySpending: {
        spent: totalSpent,
        remaining,
        percentage,
      },
      topCategories: categoryData,
      recentTransactions,
    },
  };
}
