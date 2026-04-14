"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { useRef } from "react";
import Link from "next/link";
import { joinBudget, type OnboardingState } from "@/app/onboarding/actions";

const initialState: OnboardingState = {};

const DIGIT_COUNT = 6;

export function JoinBudgetForm() {
  const [state, formAction, pending] = useActionState(
    joinBudget,
    initialState
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hiddenRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  function handleDigitChange(index: number, value: string) {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const input = inputRefs.current[index];
    if (input) {
      input.value = digit;
    }

    // Move focus forward
    if (digit && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Update hidden input
    updateHiddenValue();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      const input = inputRefs.current[index];
      if (input && !input.value && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGIT_COUNT);

    for (let i = 0; i < DIGIT_COUNT; i++) {
      const input = inputRefs.current[i];
      if (input) {
        input.value = pasted[i] ?? "";
      }
    }

    // Focus the last filled input or the next empty one
    const nextEmpty = pasted.length < DIGIT_COUNT ? pasted.length : DIGIT_COUNT - 1;
    inputRefs.current[nextEmpty]?.focus();

    updateHiddenValue();
  }

  function updateHiddenValue() {
    if (hiddenRef.current) {
      hiddenRef.current.value = inputRefs.current
        .map((input) => input?.value ?? "")
        .join("");
    }
  }

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
          Join Your Partner
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Enter the 6-digit invite code from your partner to join their budget.
        </p>

        {/* General Error */}
        {state.errors?.general && (
          <div className="mt-4 rounded-xl bg-error-container px-4 py-3 text-sm text-error">
            {state.errors.general[0]}
          </div>
        )}

        {/* Invite Code Error */}
        {state.errors?.inviteCode && (
          <div className="mt-4 rounded-xl bg-error-container px-4 py-3 text-sm text-error">
            {state.errors.inviteCode[0]}
          </div>
        )}

        {/* Form */}
        <form ref={formRef} action={formAction} className="mt-8">
          <input type="hidden" name="inviteCode" ref={hiddenRef} />

          {/* Digit inputs */}
          <div className="flex justify-center gap-3">
            {Array.from({ length: DIGIT_COUNT }).map((_, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                aria-label={`Digit ${i + 1}`}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="h-14 w-11 rounded-xl bg-surface-container-low text-center text-xl font-semibold text-on-surface focus:bg-primary-container/10 focus:outline-none transition-colors"
              />
            ))}
          </div>

          {/* Submit */}
          <SubmitButton
            label="Join Shared Budget"
            pending={pending}
            pendingLabel="Joining..."
            className="mt-8 w-full rounded-full bg-primary px-4 py-3.5 text-base font-semibold text-white shadow-[0px_12px_32px_rgba(52,47,43,0.06)] transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          />
        </form>

        {/* Help section */}
        <div className="mt-10 rounded-3xl bg-surface-container-low px-4 py-4">
          <div className="flex items-start gap-3">
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
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-on-surface">
                Can&apos;t find the code?
              </p>
              <p className="mt-1 text-xs text-outline leading-relaxed">
                Ask your partner to open their budget settings and share the
                6-digit invite code with you. They received it when they created
                the budget.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
