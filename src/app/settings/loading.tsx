import { BottomNav } from "@/components/bottom-nav";

export default function SettingsLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface pb-32 text-on-surface">
      {/* Header — same structure as settings/page.tsx */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-6 w-6 rounded-full bg-surface-container animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-surface-container animate-pulse" />
        </div>
        <div className="h-5 w-24 rounded-full bg-surface-container animate-pulse" />
      </header>
      <main className="mx-auto w-full max-w-2xl space-y-10 px-6 pt-8">
        {/* Profile skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-surface-container animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 rounded-full bg-surface-container animate-pulse" />
            <div className="h-4 w-48 rounded-full bg-surface-container animate-pulse" />
          </div>
        </div>
        {/* Budget settings skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-36 rounded-full bg-surface-container animate-pulse" />
          <div className="h-40 rounded-3xl bg-surface-container animate-pulse" />
        </div>
        {/* Preferences skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-28 rounded-full bg-surface-container animate-pulse" />
          <div className="h-32 rounded-3xl bg-surface-container animate-pulse" />
        </div>
        {/* Account / support skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-32 rounded-3xl bg-surface-container animate-pulse" />
          <div className="h-32 rounded-3xl bg-surface-container animate-pulse" />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
