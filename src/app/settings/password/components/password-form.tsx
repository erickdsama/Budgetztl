"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { changePassword, type PasswordState } from "@/app/settings/actions";

const initialState: PasswordState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    initialState
  );

  if (state.success) {
    return (
      <div className="rounded-3xl bg-primary/5 px-5 py-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="font-heading mt-3 text-base font-bold text-on-surface">
          {state.message}
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Your password has been changed. You can continue using the app.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-[0px_12px_32px_rgba(52,47,43,0.06)]">
      {/* General Error */}
      {state.errors?.general && (
        <div className="mb-4 rounded-xl bg-error-container px-4 py-3 text-sm text-error">
          {state.errors.general[0]}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-on-surface"
          >
            Current Password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="mt-2 block w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline/60 focus:bg-primary-container/10 focus:outline-none transition-colors"
            placeholder="Enter your current password"
          />
          {state.errors?.currentPassword && (
            <p className="mt-1 text-xs text-error">
              {state.errors.currentPassword[0]}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-on-surface"
          >
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-2 block w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline/60 focus:bg-primary-container/10 focus:outline-none transition-colors"
            placeholder="At least 8 characters"
          />
          {state.errors?.newPassword && (
            <p className="mt-1 text-xs text-error">
              {state.errors.newPassword[0]}
            </p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-on-surface"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-2 block w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline/60 focus:bg-primary-container/10 focus:outline-none transition-colors"
            placeholder="Re-enter your new password"
          />
          {state.errors?.confirmPassword && (
            <p className="mt-1 text-xs text-error">
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>

        {/* Submit */}
        <SubmitButton
          label="Update Password"
            pending={pending}
          pendingLabel="Updating..."
          className="w-full rounded-full bg-primary px-4 py-3.5 text-base font-semibold text-white shadow-[0px_12px_32px_rgba(52,47,43,0.06)] transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        />
      </form>
    </div>
  );
}
