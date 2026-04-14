import type { Metadata } from "next";
import Link from "next/link";
import { getAuthSession } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScheduledContent } from "@/app/settings/scheduled/components/scheduled-content";

export const metadata: Metadata = {
  title: "Scheduled Transactions | Our Sanctuary",
  description: "Manage your recurring expenses and income.",
};

export default async function ScheduledTransactionsPage() {
  // Fast cookie check for shell
  const { user } = await getAuthSession();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-12">
      {/* Header — static, no data */}
      <header className="flex items-center gap-4 px-6 py-4">
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container"
          aria-label="Back"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-primary">
            Scheduled Transactions
          </h1>
          <p className="text-xs text-secondary">
            Manage your recurring expenses and income.
          </p>
        </div>
      </header>

      {/* Info — static */}
      <div className="mx-6 mb-6 rounded-2xl bg-primary/5 border border-primary/10 px-5 py-4">
        <p className="text-sm text-on-surface-variant">
          To add a recurring transaction, go to{" "}
          <Link
            href="/transactions/new"
            className="font-semibold text-primary underline underline-offset-2"
          >
            Add Transaction
          </Link>{" "}
          and enable &quot;Set as recurring&quot; before confirming.
        </p>
      </div>

      {/* Data loads client-side via SWR */}
      <main className="flex-1 px-6">
        <ScheduledContent />
      </main>
    </div>
  );
}
