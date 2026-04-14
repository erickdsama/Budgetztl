"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

interface BudgetHealthProps {
  remaining: number;
  spent: number;
  totalBudgeted: number;
  percentage: number;
  currency: string;
}

type DonutView = "percent" | "amount";

export function BudgetHealth({
  remaining,
  spent,
  totalBudgeted,
  percentage,
  currency,
}: BudgetHealthProps) {
  const t = useTranslation();
  const [view, setView] = useState<DonutView>("percent");

  // SVG math: viewBox 0 0 100 100, r=40, circumference ≈ 251.2
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const dashFilled = (clampedPct / 100) * circumference;
  const dashGap = circumference - dashFilled;

  const centerValue =
    view === "percent" ? `${percentage}%` : formatCurrency(spent, currency);

  return (
    <div>
      {/* Title row — outside the chart container */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1 text-[11px] font-bold tracking-widest text-secondary opacity-70 uppercase">
            {t.dashboard.monthlySpending}
          </p>
          <h2 className="font-heading text-4xl font-extrabold tracking-tighter text-on-surface">
            {t.dashboard.budgetHealth}
          </h2>
        </div>
        <div className="text-right">
          <p className="font-heading text-2xl font-bold text-primary">
            {formatCurrency(remaining, currency)}
          </p>
          <p className="text-[10px] font-bold tracking-wider text-secondary uppercase">
            {t.dashboard.remaining}
          </p>
        </div>
      </div>

      {/* Chart container — gradient from cool gray to white */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-gradient-to-br from-surface-container-low to-surface-container-lowest p-8 shadow-sm">
        {/* Toggle — centered at top inside container */}
        <div
          className="absolute top-6 left-1/2 z-10 flex -translate-x-1/2 rounded-full p-1"
          style={{ backgroundColor: "rgba(218,226,249,0.3)" }}
        >
          {(["percent", "amount"] as DonutView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                view === v ? "bg-primary text-white" : "text-secondary"
              }`}
            >
              {t.dashboard[v as "percent" | "amount"]}
            </button>
          ))}
        </div>

        {/* Donut SVG */}
        <div className="relative mx-auto mt-8 h-64 w-64">
          <svg
            className="h-full w-full -rotate-90"
            viewBox="0 0 100 100"
            aria-label={`Budget ${percentage}% spent`}
          >
            {/* Track */}
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="12"
              className="text-secondary-container opacity-20"
            />
            {/* Filled arc */}
            {clampedPct > 0 && (
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke="var(--color-primary)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${dashFilled} ${dashGap}`}
              />
            )}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="mb-1 text-[10px] font-bold tracking-[0.2em] text-outline uppercase">
              {t.dashboard.spent}
            </span>
            <span className={`font-heading font-black text-on-surface max-w-[7rem] truncate ${view === "amount" ? "text-2xl" : "text-4xl"}`}>
              {centerValue}
            </span>
            <span className="mt-1 text-[10px] tracking-wider text-outline opacity-70 max-w-[8rem] truncate">
              {t.dashboard.of} {formatCurrency(totalBudgeted, currency)}
            </span>
          </div>
        </div>

        {/* Actual — top-right floating badge */}
        <div className="absolute top-6 right-6 flex flex-col items-end">
          <div className="mb-1 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(71,95,138,0.5)]" />
          <span className="text-[10px] font-bold tracking-tighter text-on-surface-variant uppercase">
            Actual
          </span>
        </div>

        {/* Budgeted — bottom-left floating label */}
        <div className="absolute bottom-6 left-6 flex flex-col items-start">
          <div className="mb-1 h-2.5 w-2.5 rounded-full bg-secondary-container" />
          <span className="text-[10px] font-bold tracking-tighter text-on-surface-variant opacity-40 uppercase">
            Budgeted
          </span>
        </div>
      </div>
    </div>
  );
}
