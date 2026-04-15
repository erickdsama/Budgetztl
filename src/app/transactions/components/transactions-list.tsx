"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTransactions, type TransactionItem } from "@/lib/hooks/use-transactions";
import { useTranslation } from "@/lib/i18n";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import { IconDisplay } from "@/app/categories/components/category-modal";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

function TransactionRow({
  tx,
  currency,
}: {
  tx: TransactionItem;
  currency: string;
}) {
  const isExpense = tx.type === "expense";
  const displayAmount = isExpense
    ? `-${formatCurrency(tx.amount, currency)}`
    : `+${formatCurrency(tx.amount, currency)}`;
  const initials = getInitials(tx.user.fullName);

  return (
    <div className="relative flex items-center justify-between rounded-2xl border border-transparent bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {tx.user.avatarUrl ? (
            <div className="h-12 w-12 overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
              <Image
                src={tx.user.avatarUrl}
                alt={tx.user.fullName}
                width={48}
                height={48}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-primary/10 shadow-sm ring-1 ring-black/5">
              <span className="text-sm font-semibold text-primary">{initials}</span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-1 text-white shadow-sm overflow-hidden">
            <IconDisplay icon={tx.category.icon} size="sm" />
          </div>
        </div>

        <div>
          <p className="font-heading font-bold text-on-surface">
            {tx.description ?? tx.category.name}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-secondary opacity-60">
            {formatRelativeDate(tx.date)}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-heading text-lg font-extrabold text-on-surface">{displayAmount}</p>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return <div className="h-20 rounded-2xl bg-surface-container animate-pulse" />;
}

function Skeleton() {
  return (
    <div className="space-y-3 py-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

// Currency is not available without fetching; we read it from the API enrichment isn't needed
// We just need currency from the budget. For the transactions page we'll rely on a prop.
interface TransactionsListProps {
  currency: string;
}

export function TransactionsList({ currency }: TransactionsListProps) {
  const t = useTranslation();
  const { items, hasMore, isLoading, isValidating, loadMore } = useTransactions(20);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isValidating) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isValidating, loadMore]);

  if (isLoading && items.length === 0) return <Skeleton />;

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-on-surface-variant">{t.dashboard.noRecentActivity}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-4">
      {items.map((tx) => (
        <TransactionRow key={tx.id} tx={tx} currency={currency} />
      ))}
      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} className="h-4" />
      {isValidating && <SkeletonRow />}
      {!hasMore && items.length > 0 && (
        <p className="py-6 text-center text-xs text-outline">
          &mdash; {t.common.noMore} &mdash;
        </p>
      )}
    </div>
  );
}
