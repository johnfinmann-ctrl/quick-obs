import { dbGet, dbPut, STORES } from "./db";
import type { LanguageCode } from "../types";

const KEY_PREFIX = "translation-override-";

export type TranslationOverrideStatus = "imported" | "unapproved";

export interface TranslationOverrideRecord {
  key: string;
  values: Record<string, string>;
  status: TranslationOverrideStatus;
  importedAt: string;
}

export async function loadTranslationOverrides(lang: LanguageCode): Promise<Record<string, string>> {
  if (lang === "da") return {};
  const row = await dbGet<TranslationOverrideRecord>(STORES.settings, `${KEY_PREFIX}${lang}`);
  return row?.values ?? {};
}

/** Gemmer en backup af den nuvaerende override-mngde, foer den erstattes. */
export async function backupTranslationOverrides(lang: LanguageCode): Promise<void> {
  const current = await loadTranslationOverrides(lang);
  if (Object.keys(current).length === 0) return;
  await dbPut(STORES.settings, {
    key: `${KEY_PREFIX}${lang}-backup-${Date.now()}`,
    values: current,
    status: "imported",
    importedAt: new Date().toISOString(),
  });
}

export async function saveTranslationOverrides(lang: LanguageCode, values: Record<string, string>): Promise<void> {
  await backupTranslationOverrides(lang);
  await dbPut(STORES.settings, {
    key: `${KEY_PREFIX}${lang}`,
    values,
    status: "unapproved",
    importedAt: new Date().toISOString(),
  });
}

/**
 * Validerer strukturen af en importeret oversaettelsesfil, foer den
 * accepteres. Afviser ukendte/ugyldige strukturer i stedet for at
 * fejle uklart senere.
 */
export function validateTranslationImport(
  payload: unknown,
  targetLang: Exclude<LanguageCode, "da">,
): { ok: true; values: Record<string, string> } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Filen er ikke et gyldigt JSON-objekt." };
  }
  const obj = payload as Record<string, unknown>;
  if (!Array.isArray(obj.entries)) {
    return { ok: false, error: "Filen mangler et 'entries'-array. Forventet format fra 'Eksportér kildetekst'." };
  }
  const values: Record<string, string> = {};
  for (const entry of obj.entries) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.key !== "string") continue;
    const text = e[targetLang];
    if (typeof text === "string" && text.trim().length > 0) {
      values[e.key] = text;
    }
  }
  if (Object.keys(values).length === 0) {
    return { ok: false, error: `Filen indeholder ingen genkendelige "${targetLang}"-oversaettelser.` };
  }
  return { ok: true, values };
}
