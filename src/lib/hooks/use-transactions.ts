"use client";

import useSWRInfinite from "swr/infinite";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

export type TransactionItem = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
  category: { id: string; name: string; icon: string };
  user: { fullName: string; avatarUrl: string | null };
};

type PageData = {
  items: TransactionItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function useTransactions(limit = 20) {
  const getKey = (pageIndex: number, previousPageData: PageData | null) => {
    if (previousPageData && !previousPageData.nextCursor) return null;
    if (pageIndex === 0) return `/api/transactions?limit=${limit}`;
    return `/api/transactions?limit=${limit}&cursor=${previousPageData!.nextCursor}`;
  };

  const { data, error, isLoading, isValidating, size, setSize } =
    useSWRInfinite<PageData>(getKey, fetcher, {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    });

  const pages = data ?? [];
  const items: TransactionItem[] = pages.flatMap((p) => p.items);
  const hasMore = pages.length > 0 ? pages[pages.length - 1].hasMore : true;

  return {
    items,
    hasMore,
    isLoading,
    isValidating,
    loadMore: () => setSize(size + 1),
    error,
  };
}
