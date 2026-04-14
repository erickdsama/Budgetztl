"use client";

import { formatCurrency } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

interface LifetimeMetricsProps {
  lifetimeSavings: number;
  efficiencyScore: number;
  currentBalance: number;
  initialBalance: number;
  currency: string;
}

export function LifetimeMetrics({
  lifetimeSavings,
  efficiencyScore,
  currentBalance,
  currency,
}: LifetimeMetricsProps) {
  const t = useTranslation();
  const balanceIsPositive = currentBalance >= 0;

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

      {/* Current Balance — hero metric */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-widest text-outline/50">
          {t.history.currentBalance}
        </p>
        <p className={`text-3xl font-light ${balanceIsPositive ? "text-primary" : "text-error"}`}>
          {formatCurrency(currentBalance, currency)}
        </p>
        <p className="text-[10px] text-outline/40">
          Running total from all months
        </p>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-widest text-outline/50">
            {t.history.lifetime}
          </p>
          <p className="text-2xl font-light text-primary">
            {formatCurrency(Math.abs(lifetimeSavings), currency)}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-widest text-outline/50">
            {t.history.efficiency}
          </p>
          <p className="text-2xl font-light text-primary">
            {efficiencyScore}%
          </p>
        </div>
      </div>
    </section>
  );
}
