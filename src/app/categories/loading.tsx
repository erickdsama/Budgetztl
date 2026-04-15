import { BottomNav } from "@/components/bottom-nav";

export default function CategoriesLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background pb-32">
      {/* Top App Bar — same structure as categories/page.tsx header */}
      <div className="fixed left-0 right-0 top-0 z-50 mx-auto flex w-full max-w-xl items-center justify-between bg-background/80 px-6 pb-4 pt-10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-surface-container animate-pulse" />
          </div>
          <div className="h-5 w-40 rounded-full bg-surface-container animate-pulse" />
        </div>
        <div className="h-6 w-6 rounded-full bg-surface-container animate-pulse" />
      </div>
      {/* Page header skeleton */}
      <div className="pt-32 px-6 pb-6 space-y-2">
        <div className="h-8 w-48 rounded-full bg-surface-container animate-pulse" />
        <div className="h-4 w-64 rounded-full bg-surface-container animate-pulse" />
      </div>
      {/* Content skeleton */}
      <div className="px-6 space-y-4">
        <div className="h-12 rounded-2xl bg-surface-container animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-surface-container animate-pulse" />
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
