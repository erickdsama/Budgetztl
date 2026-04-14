"use client";

import { createContext, useContext } from "react";
import { en, type Translations } from "./en";
import { es } from "./es";

const translations: Record<string, Translations> = { en, es };

const LanguageContext = createContext<Translations>(en);

export function LanguageProvider({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  const t = translations[lang] ?? en;
  return (
    <LanguageContext.Provider value={t}>{children}</LanguageContext.Provider>
  );
}

export function useTranslation(): Translations {
  return useContext(LanguageContext);
}
