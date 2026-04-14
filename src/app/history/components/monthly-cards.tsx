"use client";

import { useState } from "react";
import type { MonthData, MonthStatus } from "@/app/history/actions";
import { formatCurrency } from "@/lib/format";
import { RingChart } from "@/app/history/components/ring-chart";

interface MonthlyCardsProps {
  months: MonthData[];
  currency: string;
}

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function formatCurrencyCompact(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusSubtitle(status: MonthStatus): string {
  switch (status) {
    case "under_budget":
      return "Healthy balance maintained";
    case "over_budget":
      return "Budget exceeded";
    case "on_track":
      return "On track";
  }
}

function statusBadgeText(status: MonthStatus): string {
  switch (status) {
    case "under_budget":
      return "Under Budget";
    case "over_budget":
      return "Budget exceeded";
    case "on_track":
      return "On track";
  }
}

function statusBadgeColor(status: MonthStatus): string {
  switch (status) {
    case "under_budget":
      return "text-outline/60";
    case "over_budget":
      return "text-error/80";
    case "on_track":
      return "text-outline/60";
  }
}

/** Large, fully-expanded card for the most recent month */
function ExpandedMonthCard({
  month,
  currency,
  onCollapse,
}: {
  month: MonthData;
  currency: string;
  onCollapse: () => void;
}) {
  const monthName = MONTH_NAMES[month.month] ?? "";
  const percentage =
    month.budgeted > 0
      ? Math.round((month.spent / month.budgeted) * 100)
      : 0;

  return (
    <button
      type="button"
      className="w-full text-left bg-surface-container-lowest rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(52,47,43,0.12)] flex flex-col overflow-hidden cursor-pointer"
      onClick={onCollapse}
    >
      <div className="w-full text-left p-10 pb-0 pointer-events-none">
        {/* Header row: month name + ring chart */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-3xl font-light text-on-surface">
              {monthName} {month.year}
            </h3>
            <p className="text-sm font-light italic text-on-surface-variant">
              {statusSubtitle(month.status)}
            </p>
          </div>
          <RingChart
            percentage={percentage}
            status={month.status}
            size="lg"
          />
        </div>

        {/* Amount row */}
        <div className="mt-8 flex items-end justify-between border-b border-outline-variant/10 pb-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-outline/50">
              Total Shared Spent
            </p>
            <p className="text-3xl font-light text-on-surface">
              {formatCurrencyCompact(month.spent, currency)}
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-outline/50">
            of {formatCurrencyCompact(month.budgeted, currency)} budget
          </p>
        </div>
      </div>

      {/* Top Categories */}
      {month.topCategories.length > 0 && (
        <div className="px-10 pb-10 pointer-events-none">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline/50">
              Top Shared Categories
            </p>
          </div>
          <div className="space-y-6">
            {month.topCategories.map((cat, idx) => (
              <div
                key={`${cat.name}-${idx}`}
                className="flex items-center justify-between pb-4 border-b border-outline-variant/10 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-5">
                  <span className="material-symbols-outlined text-primary/60 text-[22px]">
                    {cat.icon}
                  </span>
                  <span className="text-sm font-light text-on-surface">
                    {cat.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-on-surface">
                  {formatCurrency(cat.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}

/** Compact card for past months (collapsed state) */
function CollapsedMonthCard({
  month,
  currency,
  onExpand,
}: {
  month: MonthData;
  currency: string;
  onExpand: () => void;
}) {
  const monthName = MONTH_NAMES[month.month] ?? "";
  const percentage =
    month.budgeted > 0
      ? Math.round((month.spent / month.budgeted) * 100)
      : 0;

  const amountColor =
    month.status === "over_budget" ? "text-error" : "text-on-surface";

  return (
    <button
      type="button"
      onClick={onExpand}
      className="w-full bg-surface-container-lowest rounded-[2rem] p-10 shadow-[0_10px_40px_-15px_rgba(52,47,43,0.12)] flex items-center justify-between text-left transition-colors hover:bg-surface-container-low cursor-pointer"
    >
      <div className="flex items-center justify-between w-full pointer-events-none">
        <div className="flex items-center gap-8">
          <RingChart
            percentage={percentage}
            status={month.status}
            size="sm"
          />
          <div className="space-y-1">
            <h3 className="text-2xl font-light text-on-surface">
              {monthName} {month.year}
            </h3>
            <p
              className={`text-[10px] font-bold uppercase tracking-widest ${statusBadgeColor(month.status)}`}
            >
              {statusBadgeText(month.status)}
            </p>
          </div>
        </div>
        <p className={`text-xl font-light ${amountColor}`}>
          {formatCurrencyCompact(month.spent, currency)}
        </p>
      </div>
    </button>
  );
}

export function MonthlyCards({ months, currency }: MonthlyCardsProps) {
  // The most recent month starts expanded; others start collapsed
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  if (months.length === 0) {
    return (
      <div className="rounded-[2rem] bg-surface-container-low px-6 py-12 text-center">
        <svg
          className="mx-auto h-10 w-10 text-outline/40"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
        <p className="mt-3 text-sm text-on-surface-variant">
          No spending data for this year yet.
        </p>
        <p className="mt-1 text-xs text-outline">
          Start adding transactions to see your monthly breakdown here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {months.map((month, idx) =>
        idx === expandedIndex ? (
          <ExpandedMonthCard
            key={`${month.year}-${month.month}`}
            month={month}
            currency={currency}
            onCollapse={() => setExpandedIndex(-1)}
          />
        ) : (
          <CollapsedMonthCard
            key={`${month.year}-${month.month}`}
            month={month}
            currency={currency}
            onExpand={() => setExpandedIndex(idx)}
          />
        )
      )}
    </div>
  );
}
