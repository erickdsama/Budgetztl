import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/supabase/server";
import { DashboardContent } from "@/app/dashboard/components/dashboard-content";
import { BottomNav } from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "Dashboard | Our Sanctuary",
  description: "Your financial harmony dashboard.",
};

export default async function DashboardPage() {
  const { user } = await getAuthSession();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-32">
      <header className="fixed left-0 right-0 top-0 z-40 mx-auto flex w-full max-w-xl items-center justify-between bg-background/80 px-6 pb-4 pt-10 backdrop-blur-md">
        <div className="flex -space-x-2">
          <div className="h-10 w-10 rounded-full bg-primary/10" />
          <div className="h-10 w-10 rounded-full bg-primary/5" />
        </div>
        <p className="font-heading text-xl font-black tracking-tight text-primary">
          Our Shared Sanctuary
        </p>
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-primary"
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
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-tertiary ring-2 ring-white" />
        </button>
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 space-y-10 px-6 pt-28">
        <DashboardContent />
      </main>
      <BottomNav />
    </div>
  );
}
