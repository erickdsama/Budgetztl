import { BottomNav } from "@/components/bottom-nav";

export default function HistoryLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background pb-32">
      {/* Header — same structure as history/page.tsx */}
      <div className="fixed left-0 right-0 top-0 z-40 mx-auto flex w-full max-w-xl items-center justify-between bg-background/80 px-6 pb-4 pt-10 backdrop-blur-md">
        <div className="h-10 w-10 rounded-full bg-primary/10 animate-pulse" />
        <div className="h-5 w-40 rounded-full bg-surface-container animate-pulse" />
        <div className="h-6 w-6" />
      </div>
      <main className="mx-auto w-full max-w-xl flex-1 pt-28 px-6 space-y-6">
        <div className="h-32 rounded-3xl bg-surface-container animate-pulse" />
        <div className="h-40 rounded-3xl bg-surface-container animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-surface-container animate-pulse" />
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
