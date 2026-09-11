/**
 * Tid/tidszone-hjaelpefunktioner til Quick-Obs.
 *
 * Alt beregnes via browserens indbyggede Intl/ICU-tidszonedatabase -
 * INGEN hardkodede UTC-forskydninger, sommertidsregler eller
 * landespecifikke antagelser. Dette virker automatisk korrekt for
 * Danmark, Faeroeerne, alle groenlandske IANA-tidszoner (fx
 * America/Nuuk, America/Danmarkshavn, America/Scoresbysund,
 * America/Thule) og enhver anden IANA-tidszone, inklusive halv-/kvart-
 * times-forskydninger og sommer-/vintertidsskift, fordi Intl selv
 * slaar op i den tidszonedatabase, browseren leverer.
 */

export type TimeSource = "auto" | "manual";

export interface TimeMetadata {
  /** ISO 8601 i UTC, fx "2026-08-09T21:24:00.000Z". */
  capturedAtUtc: string;
  /** IANA-tidszonenavn, fx "Europe/Copenhagen" eller "America/Nuuk". */
  timeZone: string;
  /** UTC-forskydning i minutter PAA DET KONKRETE TIDSPUNKT (tager hoejde for sommer-/vintertid). */
  utcOffsetMinutes: number;
  /** Menneskelaeselig lokal dato/tid i den angivne tidszone. */
  localDateTime: string;
  timeSource: TimeSource;
  timeEdited: boolean;
}

const MONTH_CODES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/** Enhedens registrerede IANA-tidszone, hentet fra browseren. */
export function detectDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Validerer, at en streng er en tidszone, Intl/ICU genkender. */
export function isValidIanaTimeZone(tz: string): boolean {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Beregner UTC-forskydningen i minutter for en given tidszone PAA ET
 * KONKRET TIDSPUNKT (ikke en fast regel) - haandterer dermed automatisk
 * sommer-/vintertid og historiske/regionale forskelle.
 */
export function getUtcOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" });
  const parts = dtf.formatToParts(date);
  const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+00:00";
  const match = raw.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = match[3] ? Number(match[3]) : 0;
  return sign * (hours * 60 + minutes);
}

/** Formaterer en dato som lokal dato/tid i en given IANA-tidszone. */
export function formatLocalDateTime(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("da-DK", {
      timeZone,
      dateStyle: "long",
      timeStyle: "medium",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

/**
 * DTG/Zulu-format: DDHHMMZ MON YY. Beregnes UDELUKKENDE fra Date-objektets
 * UTC-komponenter (getUTC*), som JavaScript altid opgoer korrekt uanset
 * tidszone - derfor er DTG pr. definition upaavirket af sommer-/vintertid.
 */
export function formatDtgZulu(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const mon = MONTH_CODES[date.getUTCMonth()];
  const yy = String(date.getUTCFullYear()).slice(-2);
  return `${dd}${hh}${mm}Z ${mon} ${yy}`;
}

export function buildTimeMetadata(
  date: Date,
  timeZone: string,
  timeSource: TimeSource,
  timeEdited: boolean,
): TimeMetadata {
  return {
    capturedAtUtc: date.toISOString(),
    timeZone,
    utcOffsetMinutes: getUtcOffsetMinutes(date, timeZone),
    localDateTime: formatLocalDateTime(date, timeZone),
    timeSource,
    timeEdited,
  };
}

export function formatUtcOffsetLabel(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

/** Bygger en "YYYY-MM-DDTHH:mm"-vaerdi (til <input type="datetime-local">) fra enhedens LOKALE tid - ikke UTC. */
export function nowAsLocalDateTimeInputValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/**
 * Fortolker en "YYYY-MM-DDTHH:mm"-streng (fra <input type="datetime-local">)
 * som lokal tid I EN GIVEN IANA-TIDSZONE og omregner til UTC. Bruger en
 * to-trins tilnaermelse (gaet -> genberegn forskydning -> ret) for
 * korrekt haandtering af sommer-/vintertid uden en ekstern tidszone-
 * bibliotek. Naer selve skiftetimen (den "tabte"/"gentagne" time) kan
 * resultatet i sjaeldne tilfaelde afvige med en time - en kendt,
 * dokumenteret tilnaermelse.
 */
export function localDateTimeStringToUtcDate(localStr: string, timeZone: string): Date | null {
  if (!localStr) return null;
  const naiveUtcGuess = new Date(`${localStr}:00.000Z`);
  if (Number.isNaN(naiveUtcGuess.getTime())) return null;

  const offset1 = getUtcOffsetMinutes(naiveUtcGuess, timeZone);
  const corrected = new Date(naiveUtcGuess.getTime() - offset1 * 60000);
  const offset2 = getUtcOffsetMinutes(corrected, timeZone);
  return new Date(naiveUtcGuess.getTime() - offset2 * 60000);
}
