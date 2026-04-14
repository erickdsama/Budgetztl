import type { Metadata } from "next";
import { getAuthSession } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransactionFormWrapper } from "@/app/transactions/new/components/transaction-form-wrapper";

export const metadata: Metadata = {
  title: "Add Transaction | Our Sanctuary",
  description: "Add a new expense or income to your shared budget.",
};

export default async function NewTransactionPage() {
  // Fast cookie check — no network request
  const { user } = await getAuthSession();
  if (!user) redirect("/login");

  return <TransactionFormWrapper />;
}
