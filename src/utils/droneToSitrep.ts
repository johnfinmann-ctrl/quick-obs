import type { Report } from "../types";
import { formatDtgZulu, localDateTimeStringToUtcDate, detectDeviceTimeZone, formatLocalDateTime, formatUtcOffsetLabel } from "./time";

/**
 * Bygger en strukturereret tekstblok fra en Drone-Obs-haendelse til
 * indsaettelse i SITREP's "Vaesentlige haendelser"-felt. Genererer
 * ALDRIG en automatisk trusselsklassifikation - kun de registrerede
 * observationsdata.
 */
export function buildDroneSitrepText(report: Report, t: (key: string) => string): string {
  const v = report.values;
  const lines: string[] = [];
  lines.push(`Haendelses-ID: ${report.id}`);

  const dtgRaw = v.dtg;
  if (typeof dtgRaw === "string" && dtgRaw) {
    const timeZone = detectDeviceTimeZone();
    const utcDate = localDateTimeStringToUtcDate(dtgRaw, timeZone);
    if (utcDate) {
      lines.push(`Lokal tid: ${formatLocalDateTime(utcDate, timeZone)} (${formatUtcOffsetLabel(0)})`);
      lines.push(`UTC: ${utcDate.toISOString()}`);
      lines.push(`Tidszone: ${timeZone}`);
      lines.push(`DTG: ${formatDtgZulu(utcDate)}`);
      if (v.dtgSource === "manual") lines.push("(Tidspunkt manuelt rettet)");
    }
  }

  const position = (typeof v.gpsPosition === "string" && v.gpsPosition) || (typeof v.mgrs === "string" && v.mgrs) || "";
  if (position) {
    lines.push(`Position: ${position}${v.gpsPositionSource === "manual" ? " (manuelt rettet)" : ""}`);
  }
  if (typeof v.droneCount === "string" && v.droneCount) lines.push(`Antal droner: ${v.droneCount}`);
  if (typeof v.flightPattern === "string" && v.flightPattern) lines.push(`Flyvemoenster: ${t(`fields.dronemelding.flightPatternChoice.${v.flightPattern}`)}`);
  if (typeof v.lastSeenDirection === "string" && v.lastSeenDirection) lines.push(`Sidst observerede retning: ${v.lastSeenDirection}`);

  if (Array.isArray(v.linkedObservations) && v.linkedObservations.length > 0) {
    lines.push(`Mulige tilknyttede observationer: ${v.linkedObservations.length} registreret`);
  }
  if (typeof v.disruptionType === "string" && v.disruptionType && v.disruptionType !== "none") {
    lines.push(`Kommunikations-/GPS-forstyrrelse: ${t(`fields.dronemelding.disruptionType.${v.disruptionType}`)}`);
  }

  lines.push("Bemaerk: Ingen automatisk trusselsvurdering er foretaget - alle punkter er raa observationer.");
  return lines.join("\n");
}
