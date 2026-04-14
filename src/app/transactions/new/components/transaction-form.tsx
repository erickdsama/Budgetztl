"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { useState } from "react";
import Link from "next/link";
import {
  createTransaction,
  type TransactionActionState,
} from "@/app/transactions/actions";
import { IconDisplay } from "@/app/categories/components/category-modal";
import type { Database } from "@/lib/supabase/types";
import { useTranslation } from "@/lib/i18n";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

interface TransactionFormProps {
  expenseCategories: CategoryRow[];
  incomeCategories: CategoryRow[];
  currency: string;
  today: string;
  capturedBy: { name: string; avatarUrl: string | null };
}

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case "USD":
      return "$";
    case "EUR":
      return "\u20AC";
    case "GBP":
      return "\u00A3";
    case "JPY":
      return "\u00A5";
    case "MXN":
      return "$";
    default:
      return "$";
  }
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDisplayDate(dateStr: string, todayStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (dateStr === todayStr) {
    return `Today, ${MONTH_NAMES[month - 1]} ${day}, ${year}`;
  }
  const d = new Date(year, month - 1, day);
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const initialState: TransactionActionState = {};

export function TransactionForm({ expenseCategories, incomeCategories, currency, today, capturedBy }: TransactionFormProps) {
  const t = useTranslation();
  const [state, formAction, pending] = useActionState(createTransaction, initialState);
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [amountValue, setAmountValue] = useState("");
  const [notesValue, setNotesValue] = useState("");
  const [dateValue, setDateValue] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedSubOption, setSelectedSubOption] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [endDate, setEndDate] = useState("");

  const currencySymbol = getCurrencySymbol(currency);
  const isIncome = transactionType === "income";

  const categories = isIncome ? incomeCategories : expenseCategories;
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 7);
  const hasMoreCategories = categories.length > 7;

  // Find the selected category to check for subcategory_options
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const subOptions = Array.isArray(selectedCategory?.subcategory_options)
    ? (selectedCategory.subcategory_options as string[])
    : null;

  function handleSelectCategory(catId: string) {
    setSelectedCategoryId(catId);
    setSelectedSubOption("");
    // Don't clear notes — user may have typed something
  }

  function handleSubOptionSelect(option: string) {
    const newSub = selectedSubOption === option ? "" : option;
    setSelectedSubOption(newSub);
    setNotesValue(newSub);
  }

  const firstName = capturedBy.name.split(" ")[0] ?? capturedBy.name;
  const initials = getInitials(capturedBy.name);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-4">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="font-heading text-2xl font-bold text-primary">
            {t.transaction.newEntry}
          </h1>
          <span className="mt-0.5 text-xs text-secondary">
            {t.transaction.by}{" "}
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-black text-primary">
                {initials}
              </span>
              {firstName}
            </span>
          </span>
        </div>
        {/* Spacer to balance header */}
        <div className="h-10 w-10" />
      </header>

      {/* General Error */}
      {state.errors?.general && (
        <div className="mx-6 mb-2 rounded-xl bg-error-container px-4 py-3 text-sm text-error">
          {state.errors.general[0]}
        </div>
      )}

      {/* Amount — outside form, value synced via hidden input inside form */}
      <section className="mt-8 px-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
          {t.transaction.amount}
        </p>
        <div className="mt-3 flex items-center justify-center gap-1">
          <span className="font-heading text-2xl font-bold text-primary">{currencySymbol}</span>
          <input
            id="amount-display"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            inputMode="decimal"
            value={amountValue}
            onChange={(e) => setAmountValue(e.target.value)}
            className="font-heading w-48 border-0 bg-transparent text-center text-5xl font-extrabold tracking-tight text-on-surface placeholder:text-surface-container-highest focus:outline-none focus:ring-0"
          />
        </div>
        {state.errors?.amount && (
          <p className="mt-2 text-xs text-error">{state.errors.amount[0]}</p>
        )}
      </section>

      {/* Type Toggle */}
      <div className="mt-6 px-6">
        <div className="flex rounded-2xl bg-surface-container-low p-1">
          <button
            type="button"
            onClick={() => { setTransactionType("expense"); setSelectedCategoryId(""); setSelectedSubOption(""); }}
            className={`flex flex-1 items-center justify-center rounded-xl py-3 px-4 text-sm font-bold transition-colors ${
              !isIncome ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary"
            }`}
          >
            {t.transaction.expense}
          </button>
          <button
            type="button"
            onClick={() => { setTransactionType("income"); setSelectedCategoryId(""); setSelectedSubOption(""); }}
            className={`flex flex-1 items-center justify-center rounded-xl py-3 px-4 text-sm font-bold transition-colors ${
              isIncome ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary"
            }`}
          >
            {t.transaction.income}
          </button>
        </div>
        {state.errors?.type && (
          <p className="mt-1 text-xs text-error">{state.errors.type[0]}</p>
        )}
      </div>

      {/* Category Selector */}
      <div className="mt-8 px-6">
        <h2 className="px-1 text-sm font-semibold text-secondary">
          {isIncome ? t.transaction.incomeSource : t.transaction.selectCategory}
        </h2>
        {categories.length === 0 ? (
          <div className="mt-3 rounded-3xl bg-surface-container-low px-4 py-6 text-center">
            <p className="text-sm text-on-surface-variant">{t.transaction.noCategories}</p>
            <Link href="/categories" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
              {t.transaction.createCategoriesFirst}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {visibleCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl transition-colors touch-manipulation cursor-pointer ${
                      isSelected
                        ? "border-2 border-primary-container bg-primary-container/10"
                        : "bg-surface-container-low"
                    }`}
                  >
                    {/* Failsafe iOS Overlay */}
                    <div className="absolute inset-0 z-10 pointer-events-auto" />

                    <div className="relative z-0 flex flex-col items-center gap-2 pointer-events-none">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        isSelected ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant"
                      }`}>
                        <IconDisplay icon={cat.icon} size="sm" />
                      </div>
                      <span className={`line-clamp-1 text-[10px] font-bold uppercase ${isSelected ? "text-primary" : "text-secondary"}`}>
                        {cat.name}
                      </span>
                    </div>
                  </button>
                );
              })}
              {hasMoreCategories && !showAllCategories && (
                <button
                  type="button"
                  onClick={() => setShowAllCategories(true)}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl bg-surface-container-low transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold uppercase text-secondary">More</span>
                </button>
              )}
            </div>
            {showAllCategories && hasMoreCategories && (
              <button type="button" onClick={() => setShowAllCategories(false)} className="mt-2 text-xs font-medium text-primary hover:underline">
                Show fewer
              </button>
            )}
          </>
        )}
        {state.errors?.categoryId && (
          <p className="mt-2 text-xs text-error">{state.errors.categoryId[0]}</p>
        )}
      </div>

      {/* Subcategory chips */}
      {subOptions && subOptions.length > 0 && selectedCategoryId && (
        <div className="mt-4 px-6">
          <p className="mb-2 px-1 text-xs font-semibold text-secondary">
            {t.transaction.subOption}
          </p>
          <div className="flex flex-wrap gap-2">
            {subOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSubOptionSelect(option)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  selectedSubOption === option
                    ? "bg-primary text-white"
                    : "bg-surface-container-low text-secondary"
                }`}
              >
                {option}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setSelectedSubOption(""); setNotesValue(""); }}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                !selectedSubOption
                  ? "bg-primary text-white"
                  : "bg-surface-container-low text-secondary"
              }`}
            >
              {t.transaction.other}
            </button>
          </div>
        </div>
      )}

      {/* Date picker */}
      <div className="mt-6 px-6">
        <div className="rounded-[1.5rem] bg-surface-container-low p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{t.transaction.date}</p>
                <p className="text-sm font-bold text-on-surface">{formatDisplayDate(dateValue, today)}</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowDatePicker(!showDatePicker)} className="text-sm font-bold text-primary">
              {t.common.edit}
            </button>
          </div>
          {showDatePicker && (
            <div className="mt-4">
              <input
                type="date"
                value={dateValue}
                max={today}
                onChange={(e) => { setDateValue(e.target.value); setShowDatePicker(false); }}
                className="block w-full rounded-xl bg-surface-container px-4 py-3 text-sm text-on-surface focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6 px-6">
        <div className="rounded-[1.5rem] bg-surface-container-low p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{t.transaction.notes}</p>
          </div>
          <textarea
            value={notesValue}
            onChange={(e) => { setNotesValue(e.target.value); setSelectedSubOption(""); }}
            maxLength={500}
            rows={2}
            placeholder={isIncome ? "e.g. Monthly salary from Acme Corp" : "What was this for?"}
            className="block w-full resize-none border-0 bg-transparent p-0 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Recurring toggle */}
      <div className="mt-6 px-6">
        <div className="rounded-[1.5rem] bg-surface-container-low p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{t.transaction.setRecurring}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              role="switch"
              aria-checked={isRecurring}
              className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full px-1 transition-colors duration-200 ease-in-out focus:outline-none ${
                isRecurring ? "bg-primary" : "bg-secondary-container"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
                  isRecurring ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {isRecurring && (
            <div className="space-y-4 pt-2 border-t border-outline-variant/10">
              {/* Frequency */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{t.transaction.frequency}</p>
                <div className="flex gap-2">
                  {(["weekly", "monthly", "yearly"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition-colors ${
                        frequency === f
                          ? "bg-primary text-white"
                          : "bg-surface-container text-secondary"
                      }`}
                    >
                      {t.transaction[f]}
                    </button>
                  ))}
                </div>
              </div>
              {/* End date */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{t.transaction.endDate}</p>
                <input
                  type="date"
                  value={endDate}
                  min={today}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full rounded-xl bg-surface-container px-4 py-3 text-sm text-on-surface focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* The form itself — only hidden values + submit */}
      <form action={formAction} className="px-6 pb-8 mt-6 flex flex-col flex-1">
        <input type="hidden" name="amount" value={amountValue} />
        <input type="hidden" name="type" value={transactionType} />
        <input type="hidden" name="categoryId" value={selectedCategoryId} />
        <input type="hidden" name="date" value={dateValue} />
        <input type="hidden" name="description" value={notesValue} />
        <input type="hidden" name="isRecurring" value={isRecurring ? "true" : "false"} />
        <input type="hidden" name="frequency" value={frequency} />
        <input type="hidden" name="endDate" value={endDate} />

        <div className="flex-1" />

        <SubmitButton
          label={t.transaction.confirm}
          pending={pending}
          pendingLabel={t.transaction.saving}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-primary py-5 text-lg font-extrabold text-white shadow-[0px_12px_32px_rgba(52,47,43,0.15)] transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          icon={<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" /></svg>}
        />
      </form>
    </div>
  );
}
