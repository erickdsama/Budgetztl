"use client";

import type { MonthData } from "@/app/history/actions";
import { formatCurrency } from "@/lib/format";

const MONTH_ABBR = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

interface SpendingBarChartProps {
  months: MonthData[];
  currency: string;
}

export function SpendingBarChart({ months, currency }: SpendingBarChartProps) {
  if (months.length === 0) return null;

  // Display in chronological order for chart
  const chronoMonths = [...months].sort((a, b) => a.month - b.month);

  const maxSpent = Math.max(...chronoMonths.map((m) => m.spent), 1);
  const avgBudgeted = chronoMonths.reduce((s, m) => s + m.budgeted, 0) / chronoMonths.length;
  const budgetLineRatio = avgBudgeted / maxSpent;
  const budgetLinePct = Math.min(budgetLineRatio * 100, 100);

  const BAR_HEIGHT = 120; // px, max bar height
  const BAR_WIDTH = 56; // px per bar
  const GAP = 12; // px between bars

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline/60 px-1">
        Monthly Overview
      </p>
      <div className="relative overflow-x-auto rounded-[2rem] bg-surface-container-lowest p-6 shadow-[0_10px_40px_-15px_rgba(52,47,43,0.10)]">
        {/* Budget average line label */}
        <div
          className="absolute right-6 text-[9px] font-bold text-outline/50 pointer-events-none"
          style={{ bottom: `${24 + (budgetLinePct / 100) * BAR_HEIGHT}px` }}
        >
          avg budget
        </div>

        <div
          className="flex items-end gap-3 overflow-x-auto pb-2"
          style={{ minWidth: `${chronoMonths.length * (BAR_WIDTH + GAP)}px` }}
        >
          {chronoMonths.map((month) => {
            const ratio = month.spent / maxSpent;
            const barPxHeight = Math.max(ratio * BAR_HEIGHT, 4);
            const isOver = month.status === "over_budget";
            const barColor = isOver
              ? "bg-error"
              : "bg-primary";
            const labelColor = isOver ? "text-error" : "text-primary";

            return (
              <div
                key={`${month.year}-${month.month}`}
                className="relative flex flex-col items-center gap-1"
                style={{ width: BAR_WIDTH, flexShrink: 0 }}
              >
                {/* Amount label on top */}
                <span className={`text-[9px] font-bold ${labelColor} whitespace-nowrap`}>
                  {formatCurrency(month.spent, currency)}
                </span>

                {/* Bar wrapper — fixed height so all bars share same bottom baseline */}
                <div
                  className="relative flex w-full items-end justify-center"
                  style={{ height: BAR_HEIGHT }}
                >
                  {/* Budget dashed line (relative to this bar's container) */}
                  {avgBudgeted > 0 && (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-dashed border-outline/20 pointer-events-none"
                      style={{ bottom: `${(budgetLinePct / 100) * BAR_HEIGHT}px` }}
                    />
                  )}

                  {/* Bar */}
                  <div
                    className={`w-9 rounded-t-xl ${barColor} transition-all duration-500`}
                    style={{ height: barPxHeight }}
                  />
                </div>

                {/* Month label */}
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                  {MONTH_ABBR[month.month]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
