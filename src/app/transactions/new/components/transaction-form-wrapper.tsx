"use client";

import { useTransactionForm } from "@/lib/hooks/use-transaction-form";
import { TransactionForm } from "@/app/transactions/new/components/transaction-form";

function TransactionFormSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div className="h-10 w-10 rounded-full bg-surface-container animate-pulse" />
        <div className="h-6 w-28 rounded-full bg-surface-container animate-pulse" />
        <div className="h-10 w-10" />
      </div>
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="h-4 w-32 rounded-full bg-surface-container animate-pulse" />
        <div className="h-16 w-48 rounded-full bg-surface-container animate-pulse" />
      </div>
      <div className="mt-8 h-12 rounded-2xl bg-surface-container animate-pulse" />
      <div className="mt-8 h-40 rounded-2xl bg-surface-container animate-pulse" />
    </div>
  );
}

export function TransactionFormWrapper() {
  const { data, isLoading, error } = useTransactionForm();

  if (isLoading || !data) return <TransactionFormSkeleton />;

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col bg-background px-6 pt-12">
        <p className="text-sm text-error">Failed to load form. Please refresh.</p>
      </div>
    );
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <TransactionForm
      expenseCategories={data.expenseCategories}
      incomeCategories={data.incomeCategories}
      currency={data.currency}
      today={today}
      capturedBy={data.capturedBy}
    />
  );
}
