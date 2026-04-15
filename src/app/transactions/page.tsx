import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession, getAuthUserBudget, createClient } from "@/lib/supabase/server";
import { TransactionsList } from "@/app/transactions/components/transactions-list";
import { BottomNav } from "@/components/bottom-nav";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Transactions | Our Sanctuary" };

export default async function TransactionsPage() {
  const { user } = await getAuthSession();
  if (!user) redirect("/login");

  const t = await getT();

  // Fetch currency for formatting
  let currency = "USD";
  const budgetResult = await getAuthUserBudget();
  if (budgetResult.ok) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("budgets")
      .select("currency")
      .eq("id", budgetResult.budgetId)
      .single();
    if (data) currency = data.currency;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-32">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-6 pt-10 pb-4 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant"
          aria-label="Back to dashboard"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="font-heading text-xl font-bold text-primary">
          {t.dashboard.recentActivity}
        </h1>
      </header>
      <main className="flex-1 px-6">
        <TransactionsList currency={currency} />
      </main>
      <BottomNav />
    </div>
  );
}
