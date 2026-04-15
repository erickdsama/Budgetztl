"use client";

import { useDashboard } from "@/lib/hooks/use-dashboard";
import { BudgetHealth } from "./budget-health";
import { CategoryCards } from "./category-cards";
import { CategoryDonutChart } from "./category-donut-chart";
import { RecentActivity } from "./recent-activity";

function Skeleton() {
  return (
    <div className="space-y-10">
      <div className="h-80 rounded-[2.5rem] bg-surface-container animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-surface-container animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-surface-container animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function DashboardContent() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <Skeleton />;
  if (error || !data)
    return <p className="text-sm text-error">Failed to load dashboard data.</p>;

  return (
    <>
      <BudgetHealth
        remaining={data.monthlySpending.remaining}
        spent={data.monthlySpending.spent}
        totalBudgeted={data.budget.totalBudgeted}
        percentage={data.monthlySpending.percentage}
        currency={data.budget.currency}
      />
      <CategoryDonutChart
        categories={data.spendingBreakdown}
        currency={data.budget.currency}
      />
      <CategoryCards categories={data.topCategories} currency={data.budget.currency} />
      <RecentActivity
        transactions={data.recentTransactions}
        currency={data.budget.currency}
      />
    </>
  );
}
