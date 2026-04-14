"use client";

import { useState } from "react";
import { updatePreferences, type UserPreferences } from "@/app/settings/actions";
import { useTranslation } from "@/lib/i18n";

type PreferencesSectionProps = {
  preferences: UserPreferences;
};

export function PreferencesSection({ preferences }: PreferencesSectionProps) {
  const t = useTranslation();
  const [darkMode, setDarkMode] = useState(preferences.darkMode);
  const [language, setLanguage] = useState<"en" | "es">(preferences.language ?? "en");
  const [saving, setSaving] = useState(false);

  async function handleToggleDarkMode() {
    const newValue = !darkMode;
    setDarkMode(newValue);
    setSaving(true);

    const result = await updatePreferences({ darkMode: newValue });

    setSaving(false);

    if (!result.success) {
      setDarkMode(!newValue);
    }
  }

  async function handleToggleLanguage() {
    const newLang: "en" | "es" = language === "en" ? "es" : "en";
    setLanguage(newLang);
    setSaving(true);

    const result = await updatePreferences({ language: newLang });

    setSaving(false);

    if (!result.success) {
      setLanguage(language);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-surface-container-lowest">
      {/* Dark Mode Toggle */}
      <div className="group flex items-center justify-between p-6 transition-colors hover:bg-surface-container-low">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-secondary-container p-2 text-on-secondary-container transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-on-surface">{t.settings.darkMode}</p>
            <p className="text-xs text-secondary">{t.settings.darkModeDesc}</p>
          </div>
        </div>
        {/* Toggle switch */}
        <button
          onClick={handleToggleDarkMode}
          disabled={saving}
          role="switch"
          aria-checked={darkMode}
          className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full px-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
            darkMode ? "bg-primary" : "bg-secondary-container"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
              darkMode ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Language Toggle */}
      <div className="group flex items-center justify-between p-6 transition-colors hover:bg-surface-container-low">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-secondary-container p-2 text-on-secondary-container transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-on-surface">{t.settings.language}</p>
            <p className="text-xs text-secondary">{t.settings.languageDesc}</p>
          </div>
        </div>
        {/* ES / EN pill toggle */}
        <button
          onClick={handleToggleLanguage}
          disabled={saving}
          className="flex rounded-full bg-secondary-container p-1 text-xs font-bold disabled:opacity-50"
          aria-label="Toggle language"
        >
          <span className={`rounded-full px-3 py-1 transition-colors ${language === "en" ? "bg-primary text-white" : "text-on-secondary-container"}`}>
            EN
          </span>
          <span className={`rounded-full px-3 py-1 transition-colors ${language === "es" ? "bg-primary text-white" : "text-on-secondary-container"}`}>
            ES
          </span>
        </button>
      </div>

      {/* Notifications */}
      <div className="group flex items-center justify-between p-6 transition-colors hover:bg-surface-container-low">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-secondary-container p-2 text-on-secondary-container transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-on-surface">{t.settings.notifications}</p>
            <p className="text-xs text-secondary">{t.settings.notificationsDesc}</p>
          </div>
        </div>
        <svg
          className="h-5 w-5 text-outline-variant"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </div>
  );
}
