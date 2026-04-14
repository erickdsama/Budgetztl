"use client";

import useSWR from "swr";
import type { ScheduledWithCategory } from "@/app/settings/scheduled/actions";

export type ScheduledApiData = {
  scheduled: ScheduledWithCategory[];
  error?: string;
};

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

export function useScheduled() {
  const { data, error, isLoading, mutate } = useSWR<ScheduledApiData>(
    "/api/scheduled",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    }
  );
  return { data, error, isLoading, mutate };
}
