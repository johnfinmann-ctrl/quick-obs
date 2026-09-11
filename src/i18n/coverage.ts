import { da } from "./da";
import { kl } from "./kl";
import { fo } from "./fo";

function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [];
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") return [path];
    return flattenKeys(value, path);
  });
}

function getByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

export interface CoverageStats {
  total: number;
  translated: number;
  percent: number;
}

/** Beregner hvor stor en andel af de danske streng-ID'er der har en udfyldt KL/FO-tekst (kompileret udkast, ikke inkl. runtime-importer). */
export function computeCoverage(lang: "kl" | "fo"): CoverageStats {
  const keys = flattenKeys(da);
  const pack = lang === "kl" ? kl : fo;
  const translated = keys.filter((k) => {
    const v = getByPath(pack, k);
    return typeof v === "string" && v.trim().length > 0;
  }).length;
  return {
    total: keys.length,
    translated,
    percent: keys.length ? Math.round((translated / keys.length) * 100) : 0,
  };
}

/** Returnerer de danske streng-ID'er, der IKKE har en kompileret oversaettelse for det givne sprog. */
export function getMissingKeys(lang: "kl" | "fo"): string[] {
  const keys = flattenKeys(da);
  const pack = lang === "kl" ? kl : fo;
  return keys.filter((k) => {
    const v = getByPath(pack, k);
    return !(typeof v === "string" && v.trim().length > 0);
  });
}

export function getAllDanishKeys(): string[] {
  return flattenKeys(da);
}
