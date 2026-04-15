"use client";

import Image from "next/image";
import Link from "next/link";
import { IconDisplay } from "@/app/categories/components/category-modal";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import type { DashboardTransaction } from "@/app/dashboard/actions";
import { useTranslation } from "@/lib/i18n";

interface RecentActivityProps {
  transactions: DashboardTransaction[];
  currency: string;
}

export function RecentActivity({
  transactions,
  currency,
}: RecentActivityProps) {
  const t = useTranslation();

  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl bg-surface-container-low px-6 py-8 text-center">
        <p className="text-sm text-on-surface-variant">{t.dashboard.noRecentActivity}</p>
        <Link
          href="/transactions/new"
          className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary-hover"
        >
          {t.categories.addNew}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-2xl font-bold tracking-tight text-on-surface">
          {t.dashboard.recentActivity}
        </h3>
        <Link
          href="/transactions"
          className="text-sm font-medium text-primary hover:opacity-80 transition-opacity"
        >
          {t.common.seeAll}
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {transactions.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} currency={currency} />
        ))}
      </div>
    </div>
  );
}

function TransactionRow({
  transaction,
  currency,
}: {
  transaction: DashboardTransaction;
  currency: string;
}) {
  const isExpense = transaction.type === "expense";
  const displayAmount = isExpense
    ? `-${formatCurrency(transaction.amount, currency)}`
    : `+${formatCurrency(transaction.amount, currency)}`;
  const amountColor = isExpense ? "text-on-surface" : "text-on-surface";
  const initials = getInitials(transaction.user.fullName);

  return (
    <Link
      href="/history"
      className="group relative flex items-center justify-between rounded-2xl border border-transparent bg-white p-4 transition-all hover:border-primary/10 hover:shadow-md cursor-pointer touch-manipulation"
    >
      {/* iOS Safari foolproof overlay */}
      <div className="absolute inset-0 z-20 pointer-events-auto" />

      <div className="relative z-10 flex items-center justify-between w-full pointer-events-none">
        {/* Left: avatar with category badge + description */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {/* User avatar — rounded-xl with ring */}
            {transaction.user.avatarUrl ? (
              <div className="h-12 w-12 overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
                <Image
                  src={transaction.user.avatarUrl}
                  alt={transaction.user.fullName}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-primary/10 shadow-sm ring-1 ring-black/5">
                <span className="text-sm font-semibold text-primary">
                  {initials}
                </span>
              </div>
            )}
            {/* Category icon badge — bottom-right */}
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-1 text-white shadow-sm overflow-hidden">
              <IconDisplay icon={transaction.category.icon} size="sm" />
            </div>
          </div>

          {/* Description + date */}
          <div>
            <p className="font-heading font-bold text-on-surface">
              {transaction.description ?? transaction.category.name}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-secondary opacity-60">
              {formatRelativeDate(transaction.date)}
            </p>
          </div>
        </div>

        {/* Amount — right */}
        <div className="shrink-0 text-right">
          <p className={`font-heading text-lg font-extrabold ${amountColor}`}>
            {displayAmount}
          </p>
        </div>
      </div>
    </Link>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}
