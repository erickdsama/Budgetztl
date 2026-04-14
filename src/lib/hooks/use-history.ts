"use client";

import useSWR from "swr";
import type { HistoricalData } from "@/app/history/actions";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

export function useHistory(year: number) {
  const { data, error, isLoading } = useSWR<HistoricalData>(
    `/api/history?year=${year}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );
  return { data, error, isLoading };
}
