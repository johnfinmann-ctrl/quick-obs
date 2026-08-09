import type { FieldSection, FormValues, Report } from "../types";
import { getReport } from "../storage/reports";

/**
 * Bygger en ren tekst-opsummering af en rapport ud fra dens
 * feltkonfiguration. Bruges til "Kopiér som ren tekst", download og
 * Web Share.
 */
export function buildReportText(
  report: Report,
  sections: FieldSection[],
  t: (key: string) => string,
  formTitle: string,
): string {
  const lines: string[] = [];
  lines.push(`QUICK-OBS - ${formTitle}`);
  lines.push("TEKNISK DEMO - IKKE GODKENDT TIL OPERATIV BRUG");
  lines.push(`Genereret: ${new Date(report.updatedAt).toLocaleString("da-DK")}`);
  lines.push("");

  for (const section of sections) {
    const sectionLines: string[] = [];
    for (const field of section.fields) {
      if (field.type === "media") continue;
      const value = report.values[field.id];
      if (value === undefined || value === null || value === "" || value === false) continue;
      const label = t(field.labelId);
      const displayValue =
        typeof value === "boolean" ? t("export.yes") : String(value);
      sectionLines.push(`${label}: ${displayValue}`);
    }
    if (sectionLines.length > 0) {
      lines.push(`-- ${t(section.titleId)} --`);
      lines.push(...sectionLines);
      lines.push("");
    }
  }

  if (typeof report.values.mipreText === "string" && report.values.mipreText.trim()) {
    lines.push("-- MIPRE-radiotekst --");
    lines.push(report.values.mipreText);
    lines.push("");
  }

  if (report.mediaIds.length > 0) {
    lines.push(`Vedhaeftede mediefiler: ${report.mediaIds.length} (ikke inkluderet i tekstfilen)`);
  }

  return lines.join("\n");
}

export function valuesLookAsSensitive(values: FormValues): boolean {
  // Simpel heuristik: hvis der er personhenfoerlige/medicinske felter udfyldt.
  return Boolean(
    values.personId ||
      values.whoInDistress ||
      values.mechanism ||
      values.injury ||
      values.who,
  );
}

/**
 * Udvider buildReportText for SITREP med et resume af de tilknyttede
 * rapporter (titel, position hvis kendt, antal medier) - "samler valgte
 * eksisterende rapporter, observationer, positioner og medier".
 */
export async function buildSitrepText(
  report: Report,
  sections: FieldSection[],
  t: (key: string) => string,
  formTitle: string,
): Promise<string> {
  const base = buildReportText(report, sections, t, formTitle);

  const linkedIds = report.linkedReportIds ?? [];
  if (linkedIds.length === 0) return base;

  const lines = [base, `-- ${t("fields.sitrep.linkedReports")} --`];
  for (const id of linkedIds) {
    const linked = await getReport(id);
    if (!linked) continue;
    const position =
      (typeof linked.values.gpsPosition === "string" && linked.values.gpsPosition) ||
      (typeof linked.values.coordinates === "string" && linked.values.coordinates) ||
      "-";
    lines.push(
      `${linked.title} (${new Date(linked.updatedAt).toLocaleString("da-DK")}) - ${t("fields.common.gpsPosition")}: ${position}${
        linked.mediaIds.length > 0 ? ` - ${linked.mediaIds.length} media` : ""
      }`,
    );
  }
  return lines.join("\n");
}
