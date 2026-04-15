import { BottomNav } from "@/components/bottom-nav";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background pb-32">
      {/* Header skeleton */}
      <div className="fixed left-0 right-0 top-0 z-40 mx-auto flex w-full max-w-xl items-center justify-between bg-background/80 px-6 pb-4 pt-10 backdrop-blur-md">
        <div className="flex -space-x-2">
          <div className="h-10 w-10 rounded-full bg-surface-container-high animate-pulse" />
          <div className="h-10 w-10 rounded-full bg-surface-container animate-pulse" />
        </div>
        <div className="h-5 w-40 rounded-full bg-surface-container animate-pulse" />
        <div className="h-6 w-6 rounded-full bg-surface-container animate-pulse" />
      </div>
      <main className="mx-auto w-full max-w-xl flex-1 space-y-10 px-6 pt-28">
        {/* Budget Health skeleton */}
        <div className="space-y-6">
          <div className="h-6 w-32 rounded-full bg-surface-container animate-pulse" />
          <div className="h-80 rounded-[2.5rem] bg-surface-container animate-pulse" />
        </div>
        {/* Category cards skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-24 rounded-full bg-surface-container animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-surface-container animate-pulse" />
          ))}
        </div>
        {/* Recent activity skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-32 rounded-full bg-surface-container animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-surface-container animate-pulse" />
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
