/**
 * Lokal WGS84 lat/lon <-> MGRS-konvertering.
 *
 * Ingen eksternt API - beregnes udelukkende lokalt ud fra standard
 * Transverse Mercator-projektionsformler (Snyder) og MGRS/UTM-
 * specifikationen (NGA). Testet mod offentligt kendte referencevaerdier
 * (se tests/mgrs.spec.ts) - IKKE militaert verificeret uden faglig
 * godkendelse, jf. Fase 2.2 punkt 10/13.
 *
 * Kendt begraensning: Norge/Svalbards specielle zonebredde-undtagelser
 * (56-84 grader N) er IKKE implementeret - standard zonebredde bruges
 * overalt, hvilket kan afvige fra nogle referenceimplementeringer i
 * netop dette smalle baandeomraade.
 */

const WGS84_A = 6378137.0; // store halvakse (meter)
const WGS84_F = 1 / 298.257223563; // fladtrykning
const K0 = 0.9996; // UTM-skalafaktor

const LAT_BANDS = "CDEFGHJKLMNPQRSTUVWXX"; // 20 baand C-X (uden I, O); X daekker 8 grader
const COL_LETTERS = ["ABCDEFGH", "JKLMNPQR", "STUVWXYZ"]; // 100km-soejler, cyklus paa 3 zoner
const ROW_LETTERS_EVEN = "FGHJKLMNPQRSTUVABCDE"; // 100km-raekker, lige zoner
const ROW_LETTERS_ODD = "ABCDEFGHJKLMNPQRSTUV"; // 100km-raekker, ulige zoner

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function utmZoneNumber(lon: number, lat: number): number {
  if (lat >= 56 && lat < 64 && lon >= 3 && lon < 12) return 32; // Norge-undtagelse (bredde stadig standard her)
  if (lat >= 72 && lat < 84) {
    if (lon >= 0 && lon < 9) return 31;
    if (lon >= 9 && lon < 21) return 33;
    if (lon >= 21 && lon < 33) return 35;
    if (lon >= 33 && lon < 42) return 37;
  }
  return Math.floor((lon + 180) / 6) + 1;
}

function latBandLetter(lat: number): string {
  if (lat >= 84) return "X";
  if (lat < -80) return "C";
  const index = Math.floor((lat + 80) / 8);
  return LAT_BANDS[Math.min(index, LAT_BANDS.length - 1)];
}

interface UtmResult {
  zone: number;
  hemisphere: "N" | "S";
  easting: number;
  northing: number;
}

/** WGS84 lat/lon -> UTM (Snyders formler for transverse mercator). */
function latLonToUtm(lat: number, lon: number): UtmResult {
  const zone = utmZoneNumber(lon, lat);
  const lonOrigin = toRad((zone - 1) * 6 - 180 + 3);
  const latRad = toRad(lat);
  const lonRad = toRad(lon);

  const e2 = 2 * WGS84_F - WGS84_F * WGS84_F;
  const ep2 = e2 / (1 - e2);

  const N = WGS84_A / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);
  const T = Math.tan(latRad) ** 2;
  const C = ep2 * Math.cos(latRad) ** 2;
  const A = Math.cos(latRad) * (lonRad - lonOrigin);

  const M =
    WGS84_A *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * latRad -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * Math.sin(2 * latRad) +
      ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * Math.sin(4 * latRad) -
      ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * latRad));

  let easting =
    K0 *
      N *
      (A +
        ((1 - T + C) * A ** 3) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * ep2) * A ** 5) / 120) +
    500000;

  let northing =
    K0 *
    (M +
      N *
        Math.tan(latRad) *
        ((A * A) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * A ** 4) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 330 * ep2) * A ** 6) / 720));

  const hemisphere: "N" | "S" = lat < 0 ? "S" : "N";
  if (hemisphere === "S") northing += 10000000;

  easting = Math.floor(easting);
  northing = Math.floor(northing);

  return { zone, hemisphere, easting, northing };
}

function columnLetter(zone: number, easting: number): string {
  const set = COL_LETTERS[(zone - 1) % 3];
  const col = Math.floor(easting / 100000) - 1; // 100km-blokke, 1-indekseret fra zonens vestkant
  return set[((col % 8) + 8) % 8];
}

function rowLetter(zone: number, northing: number): string {
  const set = zone % 2 === 0 ? ROW_LETTERS_EVEN : ROW_LETTERS_ODD;
  const row = Math.floor(northing / 100000);
  return set[((row % 20) + 20) % 20];
}

export interface MgrsResult {
  /** Fuld MGRS-streng ved 1 m praecision, fx "18TWL8566212488". */
  mgrs: string;
  zone: number;
  band: string;
  square: string;
}

/**
 * Konverterer WGS84 bredde-/laengdegrad til en MGRS-streng.
 * `precisionDigits` er antal cifre PR. akse (5 = 1 m, 4 = 10 m, 3 = 100 m osv.).
 */
export function latLonToMgrs(lat: number, lon: number, precisionDigits: 1 | 2 | 3 | 4 | 5 = 5): MgrsResult {
  if (lat < -80 || lat > 84) {
    throw new Error("MGRS understoetter ikke breddegrader uden for -80 til 84 grader (polare UPS-zoner er ikke implementeret).");
  }
  const utm = latLonToUtm(lat, lon);
  const band = latBandLetter(lat);
  const col = columnLetter(utm.zone, utm.easting);
  const row = rowLetter(utm.zone, utm.northing);

  const eastingInSquare = Math.floor(utm.easting % 100000);
  const northingInSquare = Math.floor(utm.northing % 100000);

  const scale = 10 ** (5 - precisionDigits);
  const e = Math.floor(eastingInSquare / scale)
    .toString()
    .padStart(precisionDigits, "0");
  const n = Math.floor(northingInSquare / scale)
    .toString()
    .padStart(precisionDigits, "0");

  const square = `${col}${row}`;
  return {
    mgrs: `${utm.zone}${band}${square}${e}${n}`,
    zone: utm.zone,
    band,
    square,
  };
}

/** Simpel formatvalidering (ikke omvendt konvertering) af en brugerindtastet MGRS-streng. */
export function isValidMgrsFormat(value: string): boolean {
  const cleaned = value.replace(/\s+/g, "").toUpperCase();
  return /^[0-9]{1,2}[C-HJ-NP-X][A-HJ-NP-Z]{2}[0-9]{2,10}$/.test(cleaned) && cleaned.replace(/^[0-9]{1,2}[A-Z]{3}/, "").length % 2 === 0;
}
