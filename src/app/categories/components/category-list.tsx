"use client";

import { useState, useTransition } from "react";
import type { CategoryWithSpent } from "@/app/categories/actions";
import { deleteCategory } from "@/app/categories/actions";
import { CategoryModal, IconDisplay } from "@/app/categories/components/category-modal";
import { useTranslation } from "@/lib/i18n";

// Map category type → tailwind color token set
// Design reference: emerald=Household, amber=Lifestyle, blue=Fixed Costs
const TYPE_COLORS: Record<string, { border: string; bg: string; text: string; bar: string; barBg: string }> = {
  household:   { border: "border-emerald-500", bg: "bg-emerald-100", text: "text-emerald-700", bar: "bg-emerald-500",  barBg: "bg-emerald-100" },
  lifestyle:   { border: "border-amber-500",   bg: "bg-amber-100",   text: "text-amber-700",   bar: "bg-amber-500",    barBg: "bg-amber-100"   },
  "fixed costs":{ border: "border-blue-500",   bg: "bg-blue-100",    text: "text-blue-700",    bar: "bg-blue-500",     barBg: "bg-blue-100"    },
};
const DEFAULT_COLORS = { border: "border-primary/60", bg: "bg-primary/10", text: "text-primary", bar: "bg-primary", barBg: "bg-primary/10" };

function getTypeColors(type: string | null) {
  if (!type) return DEFAULT_COLORS;
  return TYPE_COLORS[type.toLowerCase()] ?? DEFAULT_COLORS;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface CategoryListProps {
  categories: CategoryWithSpent[];
  transactionType?: "expense" | "income";
}

export function CategoryList({ categories, transactionType = "expense" }: CategoryListProps) {
  const t = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithSpent | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const projectedTotal = categories.reduce((sum, cat) => sum + Number(cat.monthly_budget), 0);

  function handleAddNew(e?: React.MouseEvent) {
    e?.preventDefault();
    setEditingCategory(null);
    setDeleteError(null);
    setModalKey((k) => k + 1);
    setIsModalOpen(true);
  }

  function handleEdit(category: CategoryWithSpent, e?: React.MouseEvent) {
    e?.preventDefault();
    setEditingCategory(category);
    setDeleteError(null);
    setModalKey((k) => k + 1);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingCategory(null);
  }

  function handleDelete(id: string) {
    setDeleteError(null);
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.success) setDeleteError(result.error ?? t.categories.deleteError);
      setDeletingId(null);
    });
  }

  return (
    <>
      {deleteError && (
        <div className="mx-6 mb-4 rounded-xl bg-error-container px-4 py-3 text-sm text-error">
          {deleteError}
          <button type="button" onClick={() => setDeleteError(null)} className="ml-2 font-semibold underline">
            {t.common.dismiss}
          </button>
        </div>
      )}

      {/* Projected Monthly Total — compact banner at top */}
      <div className="mx-6 mb-4 flex items-center justify-between rounded-2xl bg-primary px-5 py-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">{t.categories.monthlyTotal}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-xl font-black text-white">{formatCurrency(projectedTotal)}</span>
          <span className="text-xs text-white/60">{t.categories.monthly}</span>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {categories.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low px-6 py-12 text-center shadow-[0px_12px_32px_rgba(52,47,43,0.04)]">
            <p className="text-sm text-on-surface-variant">{t.categories.noCategories}</p>
            <p className="mt-1 text-xs text-outline">{t.categories.addFirstCategory}</p>
          </div>
        ) : (
          categories.map((cat) => {
            const colors = getTypeColors(cat.type);
            const budget = Number(cat.monthly_budget);
            const spent = cat.spent;
            const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

            return (
              <div
                key={cat.id}
                onClick={(e) => handleEdit(cat, e)}
                className={`group relative bg-surface-container-low p-6 rounded-2xl border-l-4 ${colors.border} shadow-[0px_12px_32px_rgba(52,47,43,0.04)] transition-all duration-300 hover:shadow-[0px_16px_40px_rgba(52,47,43,0.08)] cursor-pointer touch-manipulation`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleEdit(cat, e as unknown as React.MouseEvent); }}
              >
                {/* iOS tap capture */}
                <div className="absolute inset-0 z-10" />

                <div className="relative z-0 pointer-events-none">
                  {/* Row: icon + name/type | budget */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}>
                        <IconDisplay icon={cat.icon} size="md" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-on-surface leading-tight line-clamp-1">{cat.name}</h3>
                        {cat.type && (
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.text}`}>
                            {cat.type}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-1">
                        {t.categories.monthlyPlan}
                      </span>
                      <span className={`font-heading font-bold text-lg ${colors.text} truncate`}>
                        {formatCurrency(budget)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className={`w-full ${colors.barBg} h-2 rounded-full overflow-hidden`}>
                    <div
                      className={`${colors.bar} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Delete button — above overlay */}
                <div className="absolute top-3 right-3 z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }}
                    disabled={isPending && deletingId === cat.id}
                    className="rounded-full p-1.5 text-outline/30 opacity-0 transition-all hover:bg-error-container hover:text-error group-hover:opacity-100 disabled:opacity-50"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Add New Category */}
        <div
          onClick={(e) => handleAddNew(e)}
          className="group relative mt-6 flex w-full cursor-pointer touch-manipulation flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant/50 py-8 transition-all hover:border-primary/40 hover:bg-primary/5 active:bg-surface-container"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleAddNew(e as unknown as React.MouseEvent); }}
        >
          <div className="absolute inset-0 z-10" />
          <div className="relative z-0 flex flex-col items-center gap-1 pointer-events-none">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary transition-transform group-hover:scale-110">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="font-heading font-bold text-xl text-primary">{t.categories.addNew}</span>
          </div>
        </div>

      </div>

      <CategoryModal
        key={modalKey}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
        transactionType={transactionType}
      />
    </>
  );
}
