export default function NewTransactionLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 pt-12">
      {/* Header — matches TransactionForm header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low">
          <svg className="h-5 w-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </div>
        <span className="font-heading text-xl font-bold text-on-surface">New Entry</span>
        <div className="h-10 w-10" />
      </div>
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="h-4 w-32 rounded-full bg-surface-container animate-pulse" />
        <div className="h-16 w-48 rounded-full bg-surface-container animate-pulse" />
      </div>
      <div className="mt-8 h-12 rounded-2xl bg-surface-container animate-pulse" />
      <div className="mt-8 h-40 rounded-2xl bg-surface-container animate-pulse" />
    </div>
  );
}
