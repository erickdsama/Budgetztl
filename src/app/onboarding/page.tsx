import type { Metadata } from "next";
import Link from "next/link";
import { getAuthSession, getAuthUserBudget } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Get Started | Our Sanctuary",
  description: "Create or join a shared budget to start your journey.",
};

export default async function OnboardingPage() {
  // If not authenticated → login; if already has budget → dashboard
  const { user } = await getAuthSession();
  if (!user) redirect("/login");

  // Check if user already has a budget — redirect to dashboard if so
  const authResult = await getAuthUserBudget();
  if (authResult.ok) redirect("/dashboard");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <h1 className="font-heading text-center text-2xl font-light tracking-wide text-primary">
          Our Sanctuary
        </h1>

        {/* Heading */}
        <h2 className="font-heading mt-8 text-center text-3xl font-bold tracking-tight text-on-surface">
          Start Your Journey
        </h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-on-surface-variant">
          Create a new shared sanctuary for your finances, or join your
          partner&apos;s existing budget with an invite code.
        </p>

        {/* Create Button */}
        <Link
          href="/onboarding/create"
          className="mt-10 flex w-full items-center justify-center rounded-full bg-primary px-4 py-3.5 text-base font-semibold text-white shadow-[0px_12px_32px_rgba(52,47,43,0.06)] transition-colors hover:bg-primary-hover"
        >
          Create New Budget
        </Link>

        {/* Divider */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-outline-variant/15" />
          <span className="text-xs font-medium tracking-wider text-outline uppercase">
            Or
          </span>
          <div className="h-px flex-1 bg-outline-variant/15" />
        </div>

        {/* Join Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            Have an invite code from your partner?
          </p>
          <Link
            href="/onboarding/join"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-surface-container-low px-4 py-3.5 text-base font-semibold text-on-surface transition-colors hover:bg-surface-container"
          >
            Enter Code &amp; Join
          </Link>
        </div>

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
                How does it work?
              </p>
              <p className="mt-1 text-xs text-outline leading-relaxed">
                One partner creates the budget, then shares the 6-digit invite
                code. The other partner enters the code to join. Simple as that.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] tracking-wider text-outline/60 uppercase">
          &copy; 2024 Editorial Financial Harmony. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
