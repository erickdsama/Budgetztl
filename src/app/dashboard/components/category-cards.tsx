"use client";

import Link from "next/link";
import { IconDisplay } from "@/app/categories/components/category-modal";
import { formatCurrency } from "@/lib/format";
import type { DashboardCategory } from "@/app/dashboard/actions";
import { useTranslation } from "@/lib/i18n";

// Vibrant colors matching the Stitch design (from Stitch HTML tailwind.config)
const VIBRANT = [
  {
    color: "#8B5CF6",
    shadow: "rgba(139,92,246,0.3)",
    border: "rgba(139,92,246,0.05)",
    borderHover: "rgba(139,92,246,0.2)",
    bg10: "rgba(139,92,246,0.10)",
    bg5: "rgba(139,92,246,0.05)",
  },
  {
    color: "#3B82F6",
    shadow: "rgba(59,130,246,0.3)",
    border: "rgba(59,130,246,0.05)",
    borderHover: "rgba(59,130,246,0.2)",
    bg10: "rgba(59,130,246,0.10)",
    bg5: "rgba(59,130,246,0.05)",
  },
  {
    color: "#F97316",
    shadow: "rgba(249,115,22,0.3)",
    border: "rgba(249,115,22,0.05)",
    borderHover: "rgba(249,115,22,0.2)",
    bg10: "rgba(249,115,22,0.10)",
    bg5: "rgba(249,115,22,0.05)",
  },
  {
    color: "#14B8A6",
    shadow: "rgba(20,184,166,0.3)",
    border: "rgba(20,184,166,0.05)",
    borderHover: "rgba(20,184,166,0.2)",
    bg10: "rgba(20,184,166,0.10)",
    bg5: "rgba(20,184,166,0.05)",
  },
  {
    color: "#EC4899",
    shadow: "rgba(236,72,153,0.3)",
    border: "rgba(236,72,153,0.05)",
    borderHover: "rgba(236,72,153,0.2)",
    bg10: "rgba(236,72,153,0.10)",
    bg5: "rgba(236,72,153,0.05)",
  },
];

interface CategoryCardsProps {
  categories: DashboardCategory[];
  currency: string;
}

export function CategoryCards({ categories, currency }: CategoryCardsProps) {
  const t = useTranslation();

  if (categories.length === 0) {
    return (
      <div className="rounded-3xl bg-surface-container-low px-6 py-8 text-center">
        <p className="text-sm text-on-surface-variant">{t.categories.noCategories}</p>
        <Link
          href="/categories"
          className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary-hover"
        >
          {t.categories.addNew}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-2xl font-bold tracking-tight text-on-surface">
          {t.dashboard.byCategory}
        </h3>
        <Link
          href="/categories"
          className="rounded-full bg-primary/5 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
          style={{ fontSize: "0.75rem" }}
        >
          {t.dashboard.viewAnalysis}
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {categories.map((cat, i) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            currency={currency}
            accent={VIBRANT[i % VIBRANT.length]}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  currency,
  accent,
}: {
  category: DashboardCategory;
  currency: string;
  accent: (typeof VIBRANT)[number];
}) {
  const t = useTranslation();
  const isPaid = category.percentage >= 100;
  const barWidth = `${Math.min(category.percentage, 100)}%`;

  return (
    <Link
      href="/categories"
      className="group relative block overflow-hidden rounded-3xl bg-white p-5 shadow-sm transition-all cursor-pointer touch-manipulation border hover:border-[var(--hover-color)]"
      style={{
        borderColor: accent.border,
        ["--hover-color" as string]: accent.borderHover
      }}
    >
      {/*
        This transparent overlay is a foolproof fix for iOS Safari.
        It sits on top of everything and captures the tap, ensuring that
        internal decorative elements or flex-children don't swallow the event.
      */}
      <div className="absolute inset-0 z-20 pointer-events-auto" />

      <div className="relative z-10 pointer-events-none">
        {/* Decorative circle — top-right corner */}
        <div
          className="absolute -right-12 -top-12 h-24 w-24 rounded-full transition-transform duration-500 group-hover:scale-150 z-0"
          style={{ backgroundColor: accent.bg5 }}
        />

        {/* Content row */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Vibrant icon */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all"
              style={{ backgroundColor: accent.bg10, color: accent.color }}
            >
              <IconDisplay icon={category.icon} size="sm" />
            </div>

            {/* Name + utilization stacked */}
            <div>
              <h4 className="font-heading font-bold text-on-surface" style={{ fontSize: "1.125rem" }}>
                {category.name}
              </h4>
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: accent.color }}
              >
                {isPaid ? t.dashboard.paid : `${category.percentage}% ${t.dashboard.utilized}`}
              </p>
            </div>
          </div>

          {/* Amount — right side */}
          <div className="shrink-0 text-right">
            <p className="font-heading font-black text-on-surface">
              {formatCurrency(category.spent, currency)}
            </p>
            <p className="text-[10px] font-semibold text-secondary opacity-60">
              {t.dashboard.of} {formatCurrency(category.budgeted, currency)}
            </p>
          </div>
        </div>

        {/* Full-width progress bar below content */}
        <div
          className="relative z-10 mt-4 h-2.5 overflow-hidden rounded-full"
          style={{ backgroundColor: accent.bg10 }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: barWidth,
              backgroundColor: accent.color,
              boxShadow: `0 0 12px ${accent.shadow}`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}
