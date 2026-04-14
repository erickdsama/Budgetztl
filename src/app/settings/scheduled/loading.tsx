export default function ScheduledLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background pb-12">
      {/* Header skeleton */}
      <header className="flex items-center gap-4 px-6 py-4">
        <div className="h-10 w-10 rounded-full bg-surface-container animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-44 rounded-full bg-surface-container animate-pulse" />
          <div className="h-3 w-56 rounded-full bg-surface-container animate-pulse" />
        </div>
      </header>
      {/* Info box skeleton */}
      <div className="mx-6 mb-6 h-16 rounded-2xl bg-surface-container animate-pulse" />
      {/* List skeleton */}
      <main className="flex-1 px-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-surface-container animate-pulse" />
        ))}
      </main>
    </div>
  );
}
