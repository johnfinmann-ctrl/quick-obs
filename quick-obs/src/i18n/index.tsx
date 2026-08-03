import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { da } from "./da";
import { kl } from "./kl";
import { fo } from "./fo";
import type { LanguageCode, ResolvedString } from "./types";

/**
 * Interne udviklingsmarkering for manglende godkendt oversaettelse.
 * Vises ALDRIG direkte til brugeren - kun brugt til intern status
 * (fx senere admin-oversigt over oversaettelsesdaekning).
 */
const PENDING_NATIVE_TRANSLATION = "PENDING_NATIVE_TRANSLATION" as const;

const packs: Record<LanguageCode, Record<string, unknown>> = {
  da,
  kl,
  fo,
};

function getByPath(source: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

/**
 * Slaar en stabil string-ID op (fx "forms.mist.disclaimer").
 * Falder tilbage til dansk, hvis sproget mangler en godkendt oversaettelse.
 * Rå PENDING_NATIVE_TRANSLATION-tekst vises aldrig i UI'et.
 */
export function resolveString(lang: LanguageCode, key: string): ResolvedString {
  const inLanguage = lang === "da" ? undefined : getByPath(packs[lang], key);

  if (typeof inLanguage === "string" && inLanguage.length > 0) {
    return { text: inLanguage, isPendingApproval: false };
  }

  const danish = getByPath(packs.da, key);
  const fallbackText = typeof danish === "string" ? danish : key;

  return {
    text: fallbackText,
    isPendingApproval: lang !== "da",
  };
}

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  tResolved: (key: string) => ResolvedString;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("da");

  const t = useCallback((key: string) => resolveString(language, key).text, [language]);
  const tResolved = useCallback((key: string) => resolveString(language, key), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t, tResolved }),
    [language, t, tResolved],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation skal bruges inden i en LanguageProvider");
  }
  return ctx;
}

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "da", label: "Dansk" },
  { code: "kl", label: "Kalaallisut" },
  { code: "fo", label: "Foroyskt" },
];

// Eksporteres kun til fremtidig intern/dev-brug (fx admin-daekningsoversigt).
export { PENDING_NATIVE_TRANSLATION };
