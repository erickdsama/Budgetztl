"use client";

import useSWR from "swr";
import type { Database } from "@/lib/supabase/types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type TransactionFormData = {
  currency: string;
  expenseCategories: CategoryRow[];
  incomeCategories: CategoryRow[];
  capturedBy: { name: string; avatarUrl: string | null };
};

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

export function useTransactionForm() {
  const { data, error, isLoading, mutate } = useSWR<TransactionFormData>(
    "/api/transaction-form",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );
  return { data, error, isLoading, mutate };
}
