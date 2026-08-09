import { da } from "./da";
import { kl } from "./kl";
import { fo } from "./fo";

function flatten(obj: unknown, prefix = ""): Record<string, string> {
  if (typeof obj !== "object" || obj === null) return {};
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      acc[path] = value;
    } else {
      Object.assign(acc, flatten(value, path));
    }
    return acc;
  }, {});
}

function getByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

const NEVER_TRANSLATE = new Set([
  "MAYDAY", "MAYDAY RELAY", "PAN-PAN", "MGRS", "DTG", "MMSI", "EPIRB", "PLB",
  "ELT", "TCCC", "MIST", "9-LINER", "OVER", "OUT", "ROGER", "WILCO",
]);

/**
 * Genererer en komplet, saerskilt oversaettelsesfil med alle danske
 * streng-ID'er, til brug for en modersmaalstalende oversaetter (fx til
 * kalaallisut). Indeholder INGEN opfundne oversaettelser - kun de danske
 * kildetekster og tomme felter til udfyldelse, samt en liste over de
 * faste operative udtryk, der aldrig maa oversaettes.
 */
export function buildTranslationExportPayload() {
  const daFlat = flatten(da);
  const foFlat = flatten(fo);

  const entries = Object.entries(daFlat).map(([key, danishText]) => ({
    key,
    da: danishText,
    fo: (getByPath(fo, key) as string) ?? (foFlat[key] ?? ""),
    kl: (getByPath(kl, key) as string) ?? "",
  }));

  return {
    generatedAt: new Date().toISOString(),
    note:
      "Dansk (da) er kildeteksten. Udfyld 'kl' med en fagligt korrekt kalaallisut-oversaettelse. " +
      "Opfind ALDRIG noed-, medicinske eller militaere formuleringer - lad feltet staa tomt, hvis du er i tvivl.",
    neverTranslateTerms: Array.from(NEVER_TRANSLATE),
    entries,
  };
}

export function downloadTranslationExport() {
  const payload = buildTranslationExportPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `quick-obs-oversaettelse-kildetekst-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
