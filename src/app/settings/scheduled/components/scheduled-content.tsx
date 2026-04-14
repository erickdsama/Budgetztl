"use client";

import { useScheduled } from "@/lib/hooks/use-scheduled";
import { useSettings } from "@/lib/hooks/use-settings";
import { ScheduledList } from "@/app/settings/scheduled/components/scheduled-list";

function ScheduledSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-surface-container animate-pulse" />
      ))}
    </div>
  );
}

export function ScheduledContent() {
  const { data: scheduledData, isLoading: scheduledLoading, error: scheduledError } = useScheduled();
  const { data: settingsData } = useSettings();

  if (scheduledLoading || !scheduledData) return <ScheduledSkeleton />;

  if (scheduledError || scheduledData.error) {
    return (
      <div className="rounded-xl bg-error-container px-4 py-3 text-sm text-error">
        {scheduledData?.error ?? "Failed to load scheduled transactions."}
      </div>
    );
  }

  const currency = settingsData?.budget?.currency ?? "USD";

  return <ScheduledList scheduled={scheduledData.scheduled} currency={currency} />;
}
