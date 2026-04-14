import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { SettingsContent } from "@/app/settings/components/settings-content";
import { BottomNav } from "@/components/bottom-nav";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Settings | Our Sanctuary",
  description: "Manage your profile, budget settings, and preferences.",
};

export default async function SettingsPage() {
  // Auth check only — fast, cached
  const { user } = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  const t = await getT();

  return (
    <div className="flex min-h-dvh flex-col bg-surface pb-32 text-on-surface">
      {/* Header — static, no data */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-primary transition-opacity hover:opacity-80"
            aria-label="Back to dashboard"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </Link>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-primary">
            {t.settings.title}
          </h1>
        </div>
        <div className="font-heading font-bold text-primary">{t.settings.harmonize}</div>
      </header>

      <main className="mx-auto w-full max-w-2xl space-y-10 px-6 pt-8">
        {/* Data-dependent sections load client-side via SWR */}
        <SettingsContent />

        {/* Account & Support — static, no data needed */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="space-y-4">
            <h3 className="px-1 text-lg font-bold tracking-tight text-on-surface">
              {t.settings.account}
            </h3>
            <div className="space-y-1 rounded-3xl bg-surface-container-lowest p-2">
              <Link
                href="/settings/password"
                className="flex w-full items-center justify-between rounded-2xl p-4 transition-colors hover:bg-surface-container"
              >
                <div className="flex items-center gap-4">
                  <svg
                    className="h-5 w-5 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-on-surface">
                    {t.settings.changePassword}
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-outline-variant"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </Link>
              <Link
                href="/settings/scheduled"
                className="flex w-full items-center justify-between rounded-2xl p-4 transition-colors hover:bg-surface-container"
              >
                <div className="flex items-center gap-4">
                  <svg
                    className="h-5 w-5 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  <span className="text-sm font-medium text-on-surface">
                    {t.settings.scheduledTransactions}
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-outline-variant"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </Link>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="px-1 text-lg font-bold tracking-tight text-on-surface">
              {t.settings.support}
            </h3>
            <div className="space-y-1 rounded-3xl bg-surface-container-lowest p-2">
              <button className="flex w-full items-center justify-between rounded-2xl p-4 transition-colors hover:bg-surface-container">
                <div className="flex items-center gap-4">
                  <svg
                    className="h-5 w-5 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-on-surface">
                    {t.settings.helpCenter}
                  </span>
                </div>
              </button>
              <button className="flex w-full items-center justify-between rounded-2xl p-4 transition-colors hover:bg-surface-container">
                <div className="flex items-center gap-4">
                  <svg
                    className="h-5 w-5 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-on-surface">
                    {t.settings.privacyPolicy}
                  </span>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Sign Out */}
        <div className="pb-12 pt-8">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-3xl bg-error-container py-5 font-bold tracking-wide text-on-error-container transition-all hover:opacity-90 active:scale-95"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              {t.settings.signOut}
            </button>
          </form>
          <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-outline-variant">
            {t.settings.version} 2.4.1 &bull; {t.settings.builtWithLove}
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
