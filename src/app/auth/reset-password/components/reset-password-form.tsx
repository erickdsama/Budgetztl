"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { resetPassword, type AuthState } from "@/app/(auth)/actions";

const initialState: AuthState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPassword,
    initialState
  );

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <h1 className="font-heading text-center text-2xl font-light tracking-wide text-primary">
          Our Sanctuary
        </h1>

        {/* Heading */}
        <h2 className="font-heading mt-8 text-3xl font-bold tracking-tight text-on-surface">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>

        {/* Success Message */}
        {state.success && (
          <div className="mt-6 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
            {state.message}
          </div>
        )}

        {/* General Error */}
        {state.errors?.general && (
          <div className="mt-4 rounded-xl bg-error-container px-4 py-3 text-sm text-error">
            {state.errors.general[0]}
          </div>
        )}

        {/* Form */}
        {!state.success && (
          <form action={formAction} className="mt-6 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold tracking-wider text-on-surface uppercase"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="hello@yoursanctuary.com"
                required
                className="mt-2 block w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline/60 focus:bg-primary-container/10 focus:outline-none transition-colors"
              />
              {state.errors?.email && (
                <p className="mt-1 text-xs text-error">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Submit */}
            <SubmitButton
              label="Send Reset Link"
            pending={pending}
              pendingLabel="Sending..."
              className="w-full rounded-full bg-primary px-4 py-3.5 text-base font-semibold text-white shadow-[0px_12px_32px_rgba(52,47,43,0.06)] transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            />
          </form>
        )}

        {/* Back to Login */}
        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-on-surface hover:text-primary"
          >
            Sign In
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] tracking-wider text-outline/60 uppercase">
          &copy; 2024 Editorial Financial Harmony. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
