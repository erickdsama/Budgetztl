"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { signIn, signInWithOAuth, type AuthState } from "@/app/(auth)/actions";
import { useTranslation } from "@/lib/i18n";

const initialState: AuthState = {};

export function LoginForm() {
  const t = useTranslation();
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <h1 className="font-heading text-center text-2xl font-light tracking-wide text-primary">
          Our Sanctuary
        </h1>

        {/* Heading */}
        <h2 className="font-heading mt-8 text-3xl font-bold tracking-tight text-on-surface">
          {t.auth.welcomeHome}
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          {t.auth.enterDetails}
        </p>

        {/* OAuth Buttons */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => signInWithOAuth("google")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container"
          >
            <GoogleIcon />
            Google
          </button>
          <button
            type="button"
            onClick={() => signInWithOAuth("apple")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-on-surface px-4 py-3 text-sm font-medium text-surface transition-colors hover:bg-on-surface/90"
          >
            <AppleIcon />
            Apple
          </button>
        </div>

        {/* Divider */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-outline-variant/15" />
          <span className="text-xs font-medium tracking-wider text-outline uppercase">
            {t.auth.orEmail}
          </span>
          <div className="h-px flex-1 bg-outline-variant/15" />
        </div>

        {/* General Error */}
        {state.errors?.general && (
          <div className="mt-4 rounded-xl bg-error-container px-4 py-3 text-sm text-error">
            {state.errors.general[0]}
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="mt-6 space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold tracking-wider text-on-surface uppercase"
            >
              {t.auth.emailAddress}
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
              <p className="mt-1 text-xs text-error">{state.errors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold tracking-wider text-on-surface uppercase"
              >
                {t.auth.password}
              </label>
              <Link
                href="/auth/reset-password"
                className="text-xs font-medium text-primary hover:text-primary-hover"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 block w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline/60 focus:bg-primary-container/10 focus:outline-none transition-colors"
            />
            {state.errors?.password && (
              <p className="mt-1 text-xs text-error">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Remember Device */}
          <div className="flex items-center gap-2">
            <input
              id="rememberDevice"
              name="rememberDevice"
              type="checkbox"
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
            <label htmlFor="rememberDevice" className="text-sm text-on-surface-variant">
              {t.auth.rememberDevice}
            </label>
          </div>

          {/* Submit */}
          <SubmitButton
            label={t.auth.signIn}
            pending={pending}
            pendingLabel={t.auth.signInPending}
            className="w-full rounded-full bg-primary px-4 py-3.5 text-base font-semibold text-white shadow-[0px_12px_32px_rgba(52,47,43,0.06)] transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </form>

        {/* Register Link */}
        <p className="mt-8 text-center text-sm text-on-surface-variant">
          {t.auth.newToSanctuary}{" "}
          <Link
            href="/register"
            className="font-semibold text-on-surface hover:text-primary"
          >
            {t.auth.createAccount}
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

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
