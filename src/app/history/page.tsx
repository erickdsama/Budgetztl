import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/supabase/server";
import { HistoryContent } from "@/app/history/components/history-content";
import { BottomNav } from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "History | Our Sanctuary",
  description: "View your spending history, trends, and efficiency over time.",
};

export default async function HistoryPage() {
  const { user } = await getAuthSession();
  if (!user) redirect("/login");

  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-32">
      <header className="fixed left-0 right-0 top-0 z-40 mx-auto flex w-full max-w-xl items-center justify-between bg-background/80 px-6 pb-4 pt-10 backdrop-blur-md">
        <div className="h-10 w-10 rounded-full bg-primary/10" />
        <p className="font-heading text-xl font-black tracking-tight text-primary">
          Our Shared Sanctuary
        </p>
        <div className="h-6 w-6" />
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 pt-28">
        <HistoryContent year={year} />
      </main>
      <BottomNav />
    </div>
  );
}
