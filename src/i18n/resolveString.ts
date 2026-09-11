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
 * `runtimeOverride` er en admin-importeret oversaettelse (se
 * storage/translationOverrides.ts) og har forrang over den kompilerede
 * sprogpakke, men er ALDRIG automatisk "godkendt" - kun markeret som
 * importeret udkast (isPendingApproval forbliver true for alt andet end
 * dansk, uanset override).
 * Falder tilbage til dansk, hvis sproget mangler en godkendt oversaettelse.
 * Raa PENDING_NATIVE_TRANSLATION-tekst vises aldrig i UI'et.
 */
export function resolveString(
  lang: LanguageCode,
  key: string,
  runtimeOverride?: Record<string, string>,
): ResolvedString {
  const overridden = lang !== "da" ? runtimeOverride?.[key] : undefined;
  const inLanguage = overridden ?? (lang === "da" ? undefined : getByPath(packs[lang], key));

  if (typeof inLanguage === "string" && inLanguage.length > 0) {
    // Vist paa det valgte sprog (kompileret udkast eller admin-importeret) -
    // IKKE dansk fallback. "Godkendt" er en separat, ikke-automatisk status,
    // kommunikeret via sprogstatusbanneret, ikke denne markoer.
    return { text: inLanguage, isPendingApproval: false };
  }

  const danish = getByPath(packs.da, key);
  const fallbackText = typeof danish === "string" ? danish : key;

  return {
    text: fallbackText,
    isPendingApproval: lang !== "da",
  };
}
