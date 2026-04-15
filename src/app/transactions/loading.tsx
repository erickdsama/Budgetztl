import { BottomNav } from "@/components/bottom-nav";

export default function TransactionsLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background pb-32">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-6 pt-10 pb-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-surface-container-low animate-pulse" />
        <div className="h-5 w-36 rounded-full bg-surface-container animate-pulse" />
      </div>
      <main className="flex-1 px-6">
        <div className="space-y-3 py-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-surface-container animate-pulse" />
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
