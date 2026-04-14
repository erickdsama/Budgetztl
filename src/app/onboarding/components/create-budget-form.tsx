"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { createBudget, type OnboardingState } from "@/app/onboarding/actions";

const initialState: OnboardingState = {};

const currencies = [
  { code: "USD", label: "USD - US Dollar", symbol: "$" },
  { code: "EUR", label: "EUR - Euro", symbol: "\u20AC" },
  { code: "GBP", label: "GBP - British Pound", symbol: "\u00A3" },
  { code: "JPY", label: "JPY - Japanese Yen", symbol: "\u00A5" },
  { code: "MXN", label: "MXN - Mexican Peso", symbol: "$" },
] as const;

export function CreateBudgetForm() {
  const [state, formAction, pending] = useActionState(
    createBudget,
    initialState
  );

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Back button */}
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1 text-sm text-outline hover:text-on-surface transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Back
        </Link>

        {/* Heading */}
        <h1 className="font-heading mt-6 text-3xl font-bold tracking-tight text-on-surface">
          New Budget
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Set up your shared budget to start tracking together.
        </p>

        {/* General Error */}
        {state.errors?.general && (
          <div className="mt-4 rounded-xl bg-error-container px-4 py-3 text-sm text-error">
            {state.errors.general[0]}
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="mt-8 space-y-6">
          {/* Budget Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold tracking-wider text-on-surface uppercase"
            >
              Budget Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Our New Home Fund"
              required
              minLength={2}
              className="mt-2 block w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline/60 focus:bg-primary-container/10 focus:outline-none transition-colors"
            />
            {state.errors?.name && (
              <p className="mt-1 text-xs text-error">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label
              htmlFor="currency"
              className="block text-xs font-semibold tracking-wider text-on-surface uppercase"
            >
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue="USD"
              required
              className="mt-2 block w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:bg-primary-container/10 focus:outline-none appearance-none transition-colors"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            {state.errors?.currency && (
              <p className="mt-1 text-xs text-error">
                {state.errors.currency[0]}
              </p>
            )}
          </div>

          {/* Quick Tip */}
          <div className="flex gap-3 rounded-3xl bg-surface-container-low px-4 py-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
              />
            </svg>
            <div>
              <p className="text-xs font-semibold text-on-surface">Quick Tip</p>
              <p className="mt-0.5 text-xs text-outline">
                Choose a name that reflects your shared goal. After creating,
                you&apos;ll get an invite code to share with your partner.
              </p>
            </div>
          </div>

          {/* Submit */}
          <SubmitButton
            label="Create Budget"
            pending={pending}
            pendingLabel="Creating..."
            className="w-full rounded-full bg-primary px-4 py-3.5 text-base font-semibold text-white shadow-[0px_12px_32px_rgba(52,47,43,0.06)] transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          />
        </form>
      </div>
    </div>
  );
}
