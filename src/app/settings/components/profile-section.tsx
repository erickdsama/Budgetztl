"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { updateProfile } from "@/app/settings/actions";
import { useTranslation } from "@/lib/i18n";

type ProfileSectionProps = {
  fullName: string;
  email: string;
  avatarUrl: string | null;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export function ProfileSection({
  fullName,
  email,
  avatarUrl,
}: ProfileSectionProps) {
  const t = useTranslation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(fullName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSaveName() {
    if (name.trim() === fullName) {
      setIsEditingName(false);
      return;
    }

    setSaving(true);
    setError(null);

    const result = await updateProfile({ fullName: name });

    setSaving(false);

    if (result.success) {
      setIsEditingName(false);
    } else {
      setError(result.error ?? t.common.error);
    }
  }

  function handleCancelEdit() {
    setName(fullName);
    setIsEditingName(false);
    setError(null);
  }

  function handleStartEdit() {
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <section className="flex items-center gap-6 rounded-3xl bg-surface-container-low p-6">
      {/* Avatar with edit badge */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={fullName}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full border-4 border-surface-container-lowest object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface-container-lowest bg-primary text-2xl font-semibold text-white">
            {getInitials(fullName)}
          </div>
        )}
        {/* Edit badge */}
        <button
          onClick={handleStartEdit}
          aria-label="Edit profile name"
          className="absolute bottom-0 right-0 rounded-full border-2 border-surface-container-low bg-primary p-1.5 transition-opacity hover:opacity-80"
        >
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
            />
          </svg>
        </button>
      </div>

      {/* Name & Email */}
      <div className="min-w-0 flex-1">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="min-w-0 flex-1 rounded-xl bg-surface-container px-3 py-1.5 text-lg font-bold text-on-surface focus:bg-primary-container/10 focus:outline-none transition-colors"
              disabled={saving}
            />
            <button
              onClick={handleSaveName}
              disabled={saving}
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? "..." : t.common.save}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="rounded-xl bg-surface-container px-3 py-1.5 text-xs font-semibold text-outline transition-colors hover:text-on-surface disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
          </div>
        ) : (
          <h2 className="truncate text-2xl font-bold tracking-tight text-on-surface">
            {fullName}
          </h2>
        )}
        <p className="mt-0.5 truncate text-sm font-medium text-secondary">
          {email}
        </p>
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    </section>
  );
}
