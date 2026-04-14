"use client";

import useSWR from "swr";
import type { CategoryWithSpent } from "@/app/categories/actions";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

export function useCategories(type: "expense" | "income" = "expense") {
  const { data, error, isLoading, mutate } = useSWR<CategoryWithSpent[]>(
    `/api/categories?type=${type}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );
  return { categories: data ?? [], error, isLoading, mutate };
}
