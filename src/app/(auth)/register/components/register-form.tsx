"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { signUp, signInWithOAuth, type AuthState } from "@/app/(auth)/actions";

const initialState: AuthState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <h1 className="font-heading text-center text-2xl font-light tracking-wide text-primary">
          Our Sanctuary
        </h1>

        {/* Heading */}
        <h2 className="font-heading mt-8 text-3xl font-bold tracking-tight text-on-surface">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          A shared digital space designed for the two of you.
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
            Or Email
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
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold tracking-wider text-on-surface uppercase"
            >
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              required
              className="mt-2 block w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline/60 focus:bg-primary-container/10 focus:outline-none transition-colors"
            />
            {state.errors?.fullName && (
              <p className="mt-1 text-xs text-error">
                {state.errors.fullName[0]}
              </p>
            )}
          </div>

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
              <p className="mt-1 text-xs text-error">{state.errors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold tracking-wider text-on-surface uppercase"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="mt-2 block w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline/60 focus:bg-primary-container/10 focus:outline-none transition-colors"
            />
            {state.errors?.password && (
              <p className="mt-1 text-xs text-error">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold tracking-wider text-on-surface uppercase"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              required
              minLength={8}
              className="mt-2 block w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline/60 focus:bg-primary-container/10 focus:outline-none transition-colors"
            />
            {state.errors?.confirmPassword && (
              <p className="mt-1 text-xs text-error">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          {/* Submit */}
          <SubmitButton
            label="Create Account"
            pending={pending}
            pendingLabel="Creating Account..."
            className="w-full rounded-full bg-primary px-4 py-3.5 text-base font-semibold text-white shadow-[0px_12px_32px_rgba(52,47,43,0.06)] transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          />
        </form>

        {/* Feature highlights */}
        <div className="mt-8 flex justify-center gap-8">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <svg
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Shared Vision
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <svg
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            Encrypted Peace
          </div>
        </div>

        {/* Login Link */}
        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
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
    <svg
      className="h-4 w-4 fill-current"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
