"use client";

import { formatCurrency } from "@/lib/format";

interface LifetimeMetricsProps {
  lifetimeSavings: number;
  efficiencyScore: number;
  currency: string;
}

export function LifetimeMetrics({
  lifetimeSavings,
  efficiencyScore,
  currency,
}: LifetimeMetricsProps) {
  return (
    <section className="space-y-8 px-2 pb-8 border-b border-outline-variant/20">
      <div className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-outline/60">
          Lifetime Progress
        </p>
        <h2 className="text-4xl font-light text-on-surface leading-tight tracking-tight">
          Our Journey in Numbers
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-widest text-outline/50">
            Total Shared Savings
          </p>
          <p className="text-2xl font-light text-primary">
            {formatCurrency(Math.abs(lifetimeSavings), currency)}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-widest text-outline/50">
            Efficiency Score
          </p>
          <p className="text-2xl font-light text-primary">
            {efficiencyScore}%
          </p>
        </div>
      </div>
    </section>
  );
}
