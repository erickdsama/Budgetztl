import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PasswordForm } from "@/app/settings/password/components/password-form";
import { BottomNav } from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "Change Password | Our Sanctuary",
  description: "Update your account password.",
};

export default async function ChangePasswordPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-20">
      {/* Header */}
      <header className="px-6 pt-12 pb-4">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-sm text-outline transition-colors hover:text-on-surface"
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
          Settings
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight text-on-surface">
          Change Password
        </h1>
        <p className="mt-1 text-xs font-medium tracking-wider text-outline uppercase">
          Update your account password for security
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 px-6">
        <PasswordForm />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
