import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/supabase/server";
import { CategoriesContent } from "@/app/categories/components/categories-content";
import { BottomNav } from "@/components/bottom-nav";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Categories | Our Sanctuary",
  description: "Manage your budget categories and monthly allocations.",
};

export default async function CategoriesPage() {
  const { user } = await getAuthSession();
  if (!user) redirect("/login");

  const t = await getT();

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-32">
      {/* Top App Bar */}
      <header className="fixed left-0 right-0 top-0 z-50 mx-auto flex w-full max-w-xl items-center justify-between bg-background/80 px-6 pb-4 pt-10 backdrop-blur-xl pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10">
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">S</div>
          </div>
          <h1 className="font-heading text-xl font-bold tracking-tight text-primary">{t.dashboard.ourSharedSanctuary}</h1>
        </div>
        <button type="button" aria-label="Notifications" className="text-primary pointer-events-auto">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>
      </header>

      {/* Page header */}
      <div className="pt-32 px-6 pb-6">
        <h2 className="font-heading text-3xl font-extrabold tracking-tight text-primary mb-2">{t.categories.setup}</h2>
        <p className="max-w-[80%] text-sm leading-relaxed text-secondary">{t.categories.define}</p>
      </div>

      {/* Tab toggle + content — all client-side, instant switching */}
      <main className="flex-1">
        <CategoriesContent />
      </main>

      <BottomNav />
    </div>
  );
}
