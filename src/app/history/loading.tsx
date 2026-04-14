export default function HistoryLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background pb-32 px-6 pt-12 space-y-6">
      <div className="h-32 rounded-3xl bg-surface-container animate-pulse" />
      <div className="h-40 rounded-3xl bg-surface-container animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-2xl bg-surface-container animate-pulse" />
      ))}
    </div>
  );
}
