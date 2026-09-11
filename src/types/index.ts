/**
 * Quick-Obs - centrale typer.
 */

/** Hovedblankettyperne vist paa forsiden og i Blanketbiblioteket. */
export type FormKind =
  | "hurtig-rapport"
  | "meldingsblanket"
  | "sitrep"
  | "nine-liner"
  | "mist"
  | "dronemelding"
  | "sar-melding";

/** Understoettede sprog. */
export type LanguageCode = "da" | "kl" | "fo";

export type ThemeMode = "light" | "dark";

/** Status brugt i Blanketbiblioteket - maa aldrig praesenteres som militaer-/myndighedsgodkendt. */
export type FormLibraryStatus = "demo" | "udkast" | "verificeret";

/** Metadata om en blankettype, brugt til forsidens knapper, formularskaller og Blanketbiblioteket. */
export interface FormDefinition {
  kind: FormKind;
  titleId: string;
  descriptionId: string;
  disclaimerId: string;
  accent?: "default" | "mayday" | "pan-pan" | "warning";
  /** Modulfarve (hex) - fra den faste, tilgaengelige Fase 2.1-palette. Bruges til farvede modulhoveder/-knapper. */
  moduleColor: string;
  /** Blanketbibliotek-metadata (konfigurationsstyret, redigerbar i administration). */
  version: string;
  status: FormLibraryStatus;
  lastReview: string;
  active: boolean;
  sortOrder: number;
}

/** Navigationsstadier. */
export type AppView = "home" | "history" | "admin" | "contacts" | "form-library" | "drone-surveillance" | "drone-incident" | FormKind;

/** Generisk feltvaerdi-container for en blanket (Fase 2). Noeglen er felt-id'et. */
export type FormValues = Record<string, unknown>;

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "datetime"
  | "gps"
  | "mgrs"
  | "media";

export interface FieldOption {
  value: string;
  labelId: string;
}

export interface FieldDefinition {
  id: string;
  labelId: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  helpId?: string;
  /** Kun vist naar denne funktion returnerer true for de aktuelle formularvaerdier. */
  showWhen?: (values: FormValues) => boolean;
}

export interface FieldSection {
  id: string;
  titleId: string;
  fields: FieldDefinition[];
  /** Naar true, starter sektionen sammenfoldet (til lange, sjaeldent brugte sektioner). Standard: aaben. */
  defaultCollapsed?: boolean;
}

/** Et gemt, "faerdigt" (ikke-kladde) rapportobjekt i historikken. */
export interface Report {
  id: string;
  kind: FormKind;
  /** Kort titel til historiklisten, afledt af udfyldte felter. */
  title: string;
  values: FormValues;
  language: LanguageCode;
  createdAt: string;
  updatedAt: string;
  /** Reference-id'er paa vedhaeftede mediefiler i media-store. */
  mediaIds: string[];
  /** For MIST: id paa den tilknyttede 9-Liner-rapport, hvis nogen. */
  linkedReportId?: string;
  /** For SITREP: id'er paa rapporter, samlet ind i situationsrapporten. */
  linkedReportIds?: string[];
}

/** En igangvaerende, ikke-afsluttet kladde. Én pr. blankettype (Fase 2, jf. "en blanket ad gangen"). */
export interface Draft {
  kind: FormKind;
  values: FormValues;
  mediaIds: string[];
  updatedAt: string;
}

export interface MediaGpsMetadata {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
}

export interface MediaItem {
  id: string;
  blob: Blob;
  mimeType: string;
  kind: "photo" | "video" | "audio";
  sizeBytes: number;
  createdAt: string;
  /** Sat, hvis billedet er lokalt komprimeret. */
  compressed?: boolean;
  /** Brugerdefineret navn (kan omdoebes) - vises i stedet for standardnavnet, naar sat. */
  name?: string;
  /** Optagelseslaengde i sekunder, for lyd/video. */
  durationSeconds?: number;

  /** "captured" = optaget i appen. "imported" = valgt fra enhedens filer. */
  origin: "captured" | "imported";
  /** UTC-tidspunkt (ISO 8601) for selve optagelsen - IKKE oprindelige EXIF-data for importerede filer. */
  capturedAtUtc: string | null;
  timeZone: string | null;
  utcOffsetMinutes: number | null;
  localDateTime: string | null;
  /** GPS paa tidspunktet for optagelse, hvis tilgaengelig. Ikke forsoegt udledt for importerede filer. */
  gps: MediaGpsMetadata | null;
  /** For video: om mikrofonen var aktiv under optagelsen. Null = ikke relevant (foto/lyd) eller ukendt. */
  micActive: boolean | null;
}

export type ContactRegion = "groenland" | "faeroeerne" | "danmark" | "andet";
export type ContactDomain = "maritim" | "land" | "luft" | "generel";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  region: ContactRegion;
  domain: ContactDomain;
  authority: string;
  source: string;
  lastVerified: string;
  active: boolean;
  note?: string;
}

export interface AppSettings {
  region: ContactRegion | "auto";
  callsign: string;
  defaultLanguage: LanguageCode;
  theme: ThemeMode;
  /** Saltet SHA-256-hash af admin-PIN. Aldrig klartekst. */
  pinHash: string | null;
  pinSalt: string | null;
  autoDeleteHours: 0 | 24 | 48 | 72;
  /** Administratoren kan slaa kortvisning (Leaflet/OSM-fliser) fra globalt. */
  mapEnabled: boolean;
  /** Foretrukket startmodul - "home" for den almindelige forside. */
  startModule: string;
  /** Automatisk eller manuel tidszone (IANA), jf. Fase 2.1 tidszoneadministration. */
  timeZoneMode: "auto" | "manual";
  manualTimeZone: string | null;
}

/**
 * Typer til det separate droneovervaagnings-demo-interface.
 *
 * Dette er FORBEREDELSE til fremtidig, lovlig teknisk integration
 * (fx Remote ID-modtagere) - der er IKKE tilsluttet nogen sensor eller
 * datakilde i denne demo. Alle vaerdier her kommer fra lokale, tydeligt
 * markerede testdata. Ingen trusselsvurdering, maalidentifikation eller
 * bekaempelses-/reaktionsfelter maa nogensinde tilfoejes til disse typer.
 */

/** Position/telemetri-punkt for en observeret drone paa et givet tidspunkt. */
export interface DroneTelemetryPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  /** Meter over havet, hvis kendt. */
  altitudeMeters?: number;
  /** Grader, 0-359. */
  headingDegrees?: number;
  speedMetersPerSecond?: number;
}

/** Standardiseret "Remote ID"-lignende identifikationsdata, hvis udsendt af selve dronen. */
export interface DroneRemoteId {
  serialOrSessionId: string;
  operatorIdKnown: boolean;
  /** Fritekst - IKKE en juridisk klassifikation. */
  broadcastFormatNote?: string;
}

/** En enkelt sensor- eller observationskilde, der bidrager data om en drone. */
export interface DroneSensorObservation {
  id: string;
  source: "local-test-data" | "future-provider";
  observedAt: string;
  telemetry: DroneTelemetryPoint;
  remoteId?: DroneRemoteId;
  /** Rent beskrivende - aldrig en trussels- eller handlingsanbefaling. */
  note?: string;
}

/**
 * Adapter-graensefladen fremtidige, lovlige datakilder skal implementere.
 * I denne demo findes kun `LocalTestDataProvider` (se
 * src/drone-surveillance/localTestDataProvider.ts).
 */
export interface DroneDataProvider {
  id: string;
  labelId: string;
  /** True for alt andet end den lokale testdataudbyder. */
  isLiveSource: boolean;
  connected: boolean;
  fetchObservations: () => Promise<DroneSensorObservation[]>;
}
