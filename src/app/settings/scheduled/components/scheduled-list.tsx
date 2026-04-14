"use client";

import { useTransition, useState } from "react";
import type { ScheduledWithCategory } from "@/app/settings/scheduled/actions";
import { toggleScheduled, deleteScheduled } from "@/app/settings/scheduled/actions";
import { formatCurrency } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

interface ScheduledListProps {
  scheduled: ScheduledWithCategory[];
  currency: string;
}

const FREQ_ORDER = ["weekly", "monthly", "yearly"] as const;

function FrequencyBadge({ frequency }: { frequency: string }) {
  const colors: Record<string, string> = {
    weekly: "bg-primary/10 text-primary",
    monthly: "bg-secondary-container text-on-secondary-container",
    yearly: "bg-tertiary-container text-on-tertiary-container",
  };
  const color = colors[frequency] ?? "bg-surface-container text-secondary";

  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${color}`}>
      {frequency}
    </span>
  );
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ScheduledCard({ item, currency }: { item: ScheduledWithCategory; currency: string }) {
  const t = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleToggle() {
    startTransition(async () => {
      await toggleScheduled(item.id);
    });
  }

  function handleDelete() {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteScheduled(item.id);
      if (!result.success) setDeleteError(result.error ?? "Failed to delete.");
    });
  }

  const isExpense = item.type === "expense";
  const amountColor = isExpense ? "text-error" : "text-primary";
  const amountPrefix = isExpense ? "-" : "+";

  return (
    <div className={`relative rounded-2xl bg-surface-container-lowest p-5 shadow-[0px_4px_16px_rgba(52,47,43,0.06)] ${!item.is_active ? "opacity-50" : ""}`}>
      {deleteError && (
        <p className="mb-2 text-xs text-error">{deleteError}</p>
      )}
      <div className="flex items-start justify-between gap-3">
        {/* Icon + info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
            {item.category_icon ? (
              <span
                className="material-symbols-outlined text-[20px] leading-none"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                {item.category_icon}
              </span>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-heading font-bold text-sm text-on-surface line-clamp-1">
              {item.category_name ?? (isExpense ? "Expense" : "Income")}
            </p>
            {item.description && (
              <p className="text-xs text-secondary truncate">{item.description}</p>
            )}
            <p className="text-[10px] text-outline/60 mt-0.5">
              {t.scheduled.nextDue}: {formatDate(item.next_due_date)}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`font-heading font-bold text-base ${amountColor}`}>
            {amountPrefix}{formatCurrency(item.amount, currency)}
          </span>
          <FrequencyBadge frequency={item.frequency} />
        </div>
      </div>

      {/* Actions row */}
      <div className="mt-3 flex items-center justify-between border-t border-outline-variant/10 pt-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          role="switch"
          aria-checked={item.is_active}
          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-colors disabled:opacity-50 ${
            item.is_active ? "bg-primary" : "bg-secondary-container"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              item.is_active ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-xs text-outline/60">
          {item.is_active ? t.scheduled.active : t.scheduled.inactive}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-full p-1.5 text-outline/40 transition-colors hover:bg-error-container hover:text-error disabled:opacity-50"
          aria-label="Delete"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ScheduledList({ scheduled, currency }: ScheduledListProps) {
  const t = useTranslation();

  if (scheduled.length === 0) {
    return (
      <div className="rounded-2xl bg-surface-container-low px-6 py-12 text-center">
        <p className="text-sm text-on-surface-variant">{t.scheduled.empty}</p>
        <p className="mt-1 text-xs text-outline">{t.scheduled.emptySub}</p>
      </div>
    );
  }

  // Group by frequency
  const grouped = FREQ_ORDER.reduce<Record<string, ScheduledWithCategory[]>>(
    (acc, freq) => {
      const items = scheduled.filter((s) => s.frequency === freq);
      if (items.length > 0) acc[freq] = items;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      {FREQ_ORDER.map((freq) => {
        const items = grouped[freq];
        if (!items) return null;
        return (
          <div key={freq} className="space-y-3">
            <p className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-outline/60">
              {t.scheduled[freq]}
            </p>
            {items.map((item) => (
              <ScheduledCard key={item.id} item={item} currency={currency} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
