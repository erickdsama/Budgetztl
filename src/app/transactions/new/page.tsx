import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient, getAuthSession, getAuthUserBudget } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransactionForm } from "@/app/transactions/new/components/transaction-form";

export const metadata: Metadata = {
  title: "Add Transaction | Our Sanctuary",
  description: "Add a new expense or income to your shared budget.",
};

export default async function NewTransactionPage() {
  // Fast cookie check — no network request
  const { user } = await getAuthSession();
  if (!user) redirect("/login");

  return (
    <Suspense fallback={<TransactionFormSkeleton />}>
      <TransactionFormLoader userId={user.id} />
    </Suspense>
  );
}

// Async data component — fetches categories + profile, then renders the form
async function TransactionFormLoader({ userId }: { userId: string }) {
  // Budget lookup happens inside Suspense — shell already visible
  const authResult = await getAuthUserBudget();
  if (!authResult.ok) redirect("/onboarding");
  const { budgetId } = authResult;
  const supabase = await createClient();

  const [budgetResult, expenseCatsResult, incomeCatsResult, profileResult] =
    await Promise.all([
      supabase.from("budgets").select("currency").eq("id", budgetId).single(),
      supabase
        .from("categories")
        .select("*")
        .eq("budget_id", budgetId)
        .eq("transaction_type", "expense")
        .order("sort_order", { ascending: true }),
      supabase
        .from("categories")
        .select("*")
        .eq("budget_id", budgetId)
        .eq("transaction_type", "income")
        .order("sort_order", { ascending: true }),
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", userId)
        .single(),
    ]);

  const currency = budgetResult.data?.currency ?? "USD";

  // Compute today's date on the server to avoid hydration mismatch
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const capturedBy = profileResult.data
    ? {
        name: profileResult.data.full_name,
        avatarUrl: profileResult.data.avatar_url,
      }
    : { name: "You", avatarUrl: null };

  return (
    <TransactionForm
      expenseCategories={expenseCatsResult.data ?? []}
      incomeCategories={incomeCatsResult.data ?? []}
      currency={currency}
      today={today}
      capturedBy={capturedBy}
    />
  );
}

// Skeleton shown while data loads
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
