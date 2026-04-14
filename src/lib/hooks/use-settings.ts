"use client";

import useSWR from "swr";
import type { SettingsData } from "@/app/settings/actions";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<SettingsData>(
    "/api/settings",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    }
  );
  return { data, error, isLoading, mutate };
}
