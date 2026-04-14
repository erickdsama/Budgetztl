"use client";

import { useState } from "react";
import type { MonthData, MonthStatus } from "@/app/history/actions";
import { formatCurrency } from "@/lib/format";
import { RingChart } from "@/app/history/components/ring-chart";
import { useTranslation } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n/en";

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

function statusSubtitle(status: MonthStatus, t: Translations): string {
  switch (status) {
    case "under_budget":
      return t.history.healthyBalance;
    case "over_budget":
      return t.history.overBudget;
    case "on_track":
      return t.history.onTrack;
  }
}

function statusBadgeText(status: MonthStatus, t: Translations): string {
  switch (status) {
    case "under_budget":
      return t.history.underBudget;
    case "over_budget":
      return t.history.overBudget;
    case "on_track":
      return t.history.onTrack;
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
  const t = useTranslation();
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
              {statusSubtitle(month.status, t)}
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
              {t.history.totalSharedSpent}
            </p>
            <p className="text-3xl font-light text-on-surface">
              {formatCurrencyCompact(month.spent, currency)}
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-outline/50">
            {t.dashboard.of} {formatCurrencyCompact(month.budgeted, currency)} budget
          </p>
        </div>
      </div>

      {/* Balance breakdown */}
      <div className="px-10 pb-6 pointer-events-none">
        <div className="space-y-2 rounded-2xl bg-surface-container-low p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-outline/60">{t.history.openingBalance}</span>
            <span className="font-medium text-on-surface">
              {formatCurrency(month.opening_balance, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-outline/60">+ {t.history.incomeThisMonth}</span>
            <span className="font-medium text-primary">
              + {formatCurrency(month.income, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-outline/60">- {t.history.spentThisMonth}</span>
            <span className="font-medium text-error">
              - {formatCurrency(month.spent, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
            <span className="text-xs font-bold uppercase tracking-wider text-outline/60">{t.history.closingBalance}</span>
            <span className={`text-sm font-bold ${month.closing_balance >= 0 ? "text-primary" : "text-error"}`}>
              {formatCurrency(month.closing_balance, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      {month.topCategories.length > 0 && (
        <div className="px-10 pb-10 pointer-events-none">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline/50">
              {t.history.topCategories}
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
  const t = useTranslation();
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
              {statusBadgeText(month.status, t)}
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
  const t = useTranslation();
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
          {t.history.noData}
        </p>
        <p className="mt-1 text-xs text-outline">
          {t.history.noDataSub}
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
