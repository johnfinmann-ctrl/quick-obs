import type { FieldSection, FormValues, Report } from "../types";
import { getReport } from "../storage/reports";
import { detectDeviceTimeZone, localDateTimeStringToUtcDate, formatDtgZulu, formatLocalDateTime, formatUtcOffsetLabel, getUtcOffsetMinutes } from "./time";

/**
 * Bygger en ren tekst-opsummering af en rapport ud fra dens
 * feltkonfiguration. Bruges til "Kopiér som ren tekst", download og
 * Web Share. Indeholder lokal tid, tidszone, UTC og DTG for
 * rapportens DTG-felt (hvis udfyldt), samt en markering, hvis
 * tidspunkt eller position er rettet manuelt.
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

  const dtgRaw = report.values.dtg;
  if (typeof dtgRaw === "string" && dtgRaw) {
    const timeZone = detectDeviceTimeZone();
    const utcDate = localDateTimeStringToUtcDate(dtgRaw, timeZone);
    if (utcDate) {
      const offset = getUtcOffsetMinutes(utcDate, timeZone);
      const isManualTime = report.values.dtgSource === "manual";
      lines.push(
        `Lokal tid: ${formatLocalDateTime(utcDate, timeZone)} \u00b7 ${formatUtcOffsetLabel(offset)}${isManualTime ? ` (${t("export.manuallyEditedTime")})` : ""}`,
      );
      lines.push(`Tidszone: ${timeZone}`);
      lines.push(`UTC: ${utcDate.toISOString()}`);
      lines.push(`DTG: ${formatDtgZulu(utcDate)}`);
    }
  }

  const gpsRaw = report.values.gpsPosition;
  if (typeof gpsRaw === "string" && gpsRaw && report.values.gpsPositionSource === "manual") {
    lines.push(`Position: ${gpsRaw} (${t("export.manuallyEditedPosition")})`);
  }
  lines.push("");

  for (const section of sections) {
    const sectionLines: string[] = [];
    for (const field of section.fields) {
      if (field.type === "media") continue;
      if (field.id.endsWith("Source")) continue; // interne auto/manuel-markoerer, ikke et brugerfelt
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
    lines.push(
      `Vedhaeftede mediefiler: ${report.mediaIds.length} (billeder kan medtages i PDF - se eksportknappen; video/lyd deles som separate filer, ikke i denne tekst)`,
    );
  }

  return lines.join("\n");
}

export function valuesLookAsSensitive(values: FormValues, mediaCount = 0): boolean {
  // Bred OPSEC-heuristik: personhenfoerlige/medicinske felter, registreret
  // position, eller vedhaeftede medier (som kan indeholde GPS/tidsstempel-
  // metadata) - alle udloeser advarslen foer deling/eksport.
  return Boolean(
    values.personId ||
      values.whoInDistress ||
      values.mechanism ||
      values.injury ||
      values.who ||
      values.gpsPosition ||
      values.mgrs ||
      values.coordinates ||
      mediaCount > 0,
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
