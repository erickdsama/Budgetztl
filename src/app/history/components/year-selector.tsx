"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface YearSelectorProps {
  years: number[];
  selectedYear: number;
}

export function YearSelector({ years, selectedYear }: YearSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleYearChange = useCallback(
    (year: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("year", String(year));
      router.push(`/history?${params.toString()}`);
    },
    [router, searchParams]
  );

  if (years.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 rounded-2xl bg-surface-container p-1">
      {years.map((year) => {
        const isActive = year === selectedYear;
        return (
          <button
            key={year}
            type="button"
            onClick={() => handleYearChange(year)}
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-white shadow-[0px_12px_32px_rgba(52,47,43,0.06)]"
                : "text-outline hover:text-on-surface"
            }`}
          >
            {year}
          </button>
        );
      })}
    </div>
  );
}
