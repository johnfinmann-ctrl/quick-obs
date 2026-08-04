import { da } from "./da";
import { kl } from "./kl";
import { fo } from "./fo";
import type { LanguageCode, ResolvedString } from "./types";

/**
 * Intern udviklingsmarkering for manglende godkendt oversaettelse.
 * Vises ALDRIG direkte til brugeren - kun til intern status (fx senere
 * admin-oversigt over oversaettelsesdaekning).
 */
export const PENDING_NATIVE_TRANSLATION = "PENDING_NATIVE_TRANSLATION" as const;

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
 * Raa PENDING_NATIVE_TRANSLATION-tekst vises aldrig i UI'et.
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
