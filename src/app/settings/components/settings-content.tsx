"use client";

import { useSettings } from "@/lib/hooks/use-settings";
import { ProfileSection } from "@/app/settings/components/profile-section";
import { BudgetSettings } from "@/app/settings/components/budget-settings";
import { PreferencesSection } from "@/app/settings/components/preferences-section";

function SettingsSkeleton() {
  return (
    <div className="space-y-10">
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
    </div>
  );
}

export function SettingsContent() {
  const { data, error, isLoading } = useSettings();

  if (isLoading) return <SettingsSkeleton />;

  if (error || !data) {
    return (
      <p className="text-sm text-error">Failed to load settings. Please refresh.</p>
    );
  }

  const { profile, budget, members, isOwner } = data;

  return (
    <>
      {/* Profile Section */}
      <ProfileSection
        fullName={profile.fullName}
        email={profile.email}
        avatarUrl={profile.avatarUrl}
      />

      {/* Budget Settings */}
      <section className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <h3 className="text-lg font-bold tracking-tight text-on-surface">
            Budget Settings
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            Shared with{" "}
            {members
              .filter((m) => m.userId !== profile.id)
              .map((m) => m.fullName.split(" ")[0])
              .join(", ") || "No partner yet"}
          </span>
        </div>
        <BudgetSettings
          budgetId={budget.id}
          budgetName={budget.name}
          currency={budget.currency}
          initialBalance={budget.initialBalance}
          members={members}
          isOwner={isOwner}
          currentUserId={profile.id}
        />
      </section>

      {/* Preferences */}
      <section className="space-y-4">
        <h3 className="px-1 text-lg font-bold tracking-tight text-on-surface">
          Preferences
        </h3>
        <PreferencesSection preferences={profile.preferences} />
      </section>
    </>
  );
}
