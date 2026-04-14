"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import {
  createCategory,
  updateCategory,
  type CategoryActionState,
} from "@/app/categories/actions";
import type { Database } from "@/lib/supabase/types";
import { useTranslation } from "@/lib/i18n";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

const ICON_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "movie", label: "Movie" },
  { value: "fitness_center", label: "Fitness" },
  { value: "medical_services", label: "Medical" },
  { value: "pets", label: "Pets" },
  { value: "school", label: "School" },
  { value: "local_gas_station", label: "Gas" },
  { value: "style", label: "Style" },
  { value: "celebration", label: "Party" },
  { value: "more_horiz", label: "More" },
  { value: "shopping_basket", label: "Grocery" },
  { value: "restaurant", label: "Dining" },
  { value: "bolt", label: "Bolt" },
  { value: "commute", label: "Transit" },
  { value: "shopping_bag", label: "Shop" },
  { value: "payments", label: "Payments" },
  { value: "star", label: "Star" },
  { value: "trending_up", label: "Trending" },
  { value: "card_giftcard", label: "Gift" },
  { value: "replay", label: "Refund" },
  { value: "swap_horiz", label: "Transfer" },
] as const;

const TYPE_OPTIONS = ["Household", "Lifestyle", "Fixed Costs", "Income"] as const;

function IconDisplay({ icon, size = "md" }: { icon: string; size?: "sm" | "md" }) {
  const fontSize = size === "sm" ? "text-[18px]" : "text-[22px]";
  return (
    <span
      className={`material-symbols-outlined ${fontSize} leading-none`}
      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
    >
      {icon}
    </span>
  );
}

export { IconDisplay };

function ModalSubmitButton({ isEditing, pending }: { isEditing: boolean; pending: boolean }) {
  const t = useTranslation();
  return (
    <button
      type="submit"
      form="category-form"
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-full bg-primary py-5 text-lg font-black text-white shadow-[0px_16px_32px_rgba(52,47,43,0.15)] transition-all active:scale-95 disabled:opacity-50"
    >
      {pending ? (
        t.transaction.saving
      ) : (
        <>
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
          </svg>
          {isEditing ? t.categories.updateCategory : t.categories.saveCategory}
        </>
      )}
    </button>
  );
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryRow | null;
  transactionType?: "expense" | "income";
}

const initialState: CategoryActionState = {};

export function CategoryModal({ isOpen, onClose, category, transactionType = "expense" }: CategoryModalProps) {
  const t = useTranslation();
  const isEditing = !!category;

  const [createState, createAction, createPending] = useActionState(
    createCategory,
    initialState
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateCategory,
    initialState
  );

  const state = isEditing ? updateState : createState;
  const formAction = isEditing ? updateAction : createAction;

  // Close modal automatically when the server action succeeds
  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  if (!isOpen) return null;

  const formKey = category?.id || "new";

  // Parse existing subcategory_options for display
  const existingSubOptions: string =
    Array.isArray(category?.subcategory_options)
      ? (category.subcategory_options as string[]).join(", ")
      : "";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-4 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300">
      {/* Backdrop — Click anywhere outside to close */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-xl self-end sm:self-center rounded-t-[2.5rem] sm:rounded-[2.5rem] bg-surface-container-lowest p-8 pb-[calc(env(safe-area-inset-bottom,2rem)+2rem)] sm:pb-8 shadow-[0px_-16px_48px_rgba(52,47,43,0.12)] border border-outline-variant/10 flex flex-col max-h-[92vh] overflow-hidden transition-all duration-300 translate-y-0"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl font-black text-primary">
            {isEditing ? t.categories.editCategory : t.categories.newCategory}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-outline transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label={t.common.close}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {/* General Error */}
          {state.errors?.general && (
            <div className="mb-6 rounded-2xl bg-error-container px-4 py-3 text-sm text-error">
              {state.errors.general[0]}
            </div>
          )}

          <form action={formAction} id="category-form" className="space-y-8 pb-4">
            {isEditing && category && (
              <input type="hidden" name="id" value={category.id} />
            )}
            {/* Hidden transaction_type */}
            <input
              type="hidden"
              name="transaction_type"
              value={isEditing ? (category?.transaction_type ?? transactionType) : transactionType}
            />

            {/* Icon Grid Selector */}
            <div className="space-y-4" key={`${formKey}-icons`}>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">
                {t.categories.chooseIcon}
              </label>
              <div className="grid grid-cols-5 gap-3">
                {ICON_OPTIONS.map((opt) => (
                  <label key={opt.value} className="relative group cursor-pointer">
                    <input
                      type="radio"
                      name="icon"
                      value={opt.value}
                      defaultChecked={isEditing ? category?.icon === opt.value : opt.value === "home"}
                      className="peer sr-only"
                    />
                    <div className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-surface-container-low text-outline transition-all group-hover:bg-surface-container peer-checked:bg-primary/10 peer-checked:text-primary peer-checked:ring-2 peer-checked:ring-primary/20">
                      <IconDisplay icon={opt.value} size="sm" />
                    </div>
                  </label>
                ))}
              </div>
              {state.errors?.icon && (
                <p className="text-xs font-bold text-error">{state.errors.icon[0]}</p>
              )}
            </div>

            {/* Category Name Input */}
            <div className="space-y-3" key={`${formKey}-name`}>
              <label
                htmlFor="cat-name"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-outline"
              >
                {t.categories.categoryName}
              </label>
              <input
                id="cat-name"
                name="name"
                type="text"
                defaultValue={isEditing ? category?.name : ""}
                placeholder="e.g. Groceries"
                required
                className="w-full rounded-2xl border-0 bg-surface-container-low px-6 py-4 font-heading text-lg font-bold text-on-surface placeholder:text-outline/30 focus:bg-surface-container focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
              {state.errors?.name && (
                <p className="text-xs font-bold text-error">{state.errors.name[0]}</p>
              )}
            </div>

            {/* Category Type Dropdown */}
            <div className="space-y-3">
              <label
                htmlFor="cat-type"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-outline"
              >
                {t.categories.categoryType}
              </label>
              <div className="relative">
                <select
                  id="cat-type"
                  name="type"
                  defaultValue={isEditing ? (category?.type ?? "") : (transactionType === "income" ? "Income" : "Household")}
                  className="w-full appearance-none rounded-2xl border-0 bg-surface-container-low px-6 py-4 font-heading text-lg font-bold text-on-surface focus:bg-surface-container focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                >
                  {TYPE_OPTIONS.map((tp) => (
                    <option key={tp} value={tp}>
                      {tp}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-outline">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sub-options (optional) */}
            <div className="space-y-3">
              <label
                htmlFor="cat-suboptions"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-outline"
              >
                {t.categories.subOptions}
              </label>
              <input
                id="cat-suboptions"
                name="subcategory_options"
                type="text"
                defaultValue={existingSubOptions}
                placeholder={t.categories.subOptionsPlaceholder}
                className="w-full rounded-2xl border-0 bg-surface-container-low px-6 py-4 font-heading text-base font-bold text-on-surface placeholder:text-outline/30 focus:bg-surface-container focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
              <p className="text-[10px] text-outline/60">Comma-separated options shown as chips in the transaction form.</p>
            </div>

            {/* Monthly Budget Input */}
            <div className="space-y-3">
              <label
                htmlFor="cat-budget"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-outline"
              >
                {t.categories.monthlyPlanAmount}
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-heading text-lg font-black text-outline/40">
                  $
                </span>
                <input
                  id="cat-budget"
                  name="monthlyBudget"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={isEditing ? category?.monthly_budget : ""}
                  placeholder="0.00"
                  className="w-full rounded-2xl border-0 bg-surface-container-low py-4 pl-12 pr-6 font-heading text-lg font-bold text-on-surface placeholder:text-outline/30 focus:bg-surface-container focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>
              {state.errors?.monthlyBudget && (
                <p className="text-xs font-bold text-error">{state.errors.monthlyBudget[0]}</p>
              )}
            </div>
          </form>
        </div>

        {/* Submit Button */}
        <div className="mt-8 shrink-0">
          <ModalSubmitButton isEditing={isEditing} pending={isEditing ? updatePending : createPending} />
        </div>
      </div>
    </div>
  );
}
