"use client";

import { useHistory } from "@/lib/hooks/use-history";
import { LifetimeMetrics } from "./lifetime-metrics";
import { MonthlyCards } from "./monthly-cards";
import { SpendingBarChart } from "./spending-bar-chart";
import { MonthlyBalanceChart } from "./monthly-balance-chart";

function Skeleton() {
  return (
    <div className="space-y-6 px-6">
      <div className="h-32 rounded-3xl bg-surface-container animate-pulse" />
      <div className="h-40 rounded-3xl bg-surface-container animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-2xl bg-surface-container animate-pulse" />
      ))}
    </div>
  );
}

export function HistoryContent({ year }: { year: number }) {
  const { data, isLoading, error } = useHistory(year);

  if (isLoading) return <Skeleton />;
  if (error || !data)
    return <p className="px-6 text-sm text-error">Failed to load history.</p>;

  return (
    <div className="px-6 pb-6 space-y-8">
      <LifetimeMetrics
        lifetimeSavings={data.lifetimeSavings}
        efficiencyScore={data.efficiencyScore}
        currentBalance={data.currentBalance}
        initialBalance={data.initialBalance}
        currency={data.currency}
      />
      {data.months.length > 0 && (
        <>
          <MonthlyBalanceChart months={data.months} currency={data.currency} />
          <SpendingBarChart months={data.months} currency={data.currency} />
        </>
      )}
      <MonthlyCards months={data.months} currency={data.currency} />
    </div>
  );
}
