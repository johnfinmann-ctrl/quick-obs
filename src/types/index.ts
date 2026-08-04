/**
 * Quick-Obs - centrale typer.
 *
 * Fase 1 indeholder kun de typer, der er noedvendige for grundlayout,
 * navigation, sprog og tema. Feltdefinitioner for de enkelte blanketter
 * (9-Liner, MIST, osv.) tilfoejes i Fase 2 sammen med den
 * konfigurationsstyrede formular-motor.
 */

/** De fem hovedblankettyper vist paa forsiden. */
export type FormKind =
  | "meldingsblanket"
  | "nine-liner"
  | "mist"
  | "dronemelding"
  | "sar-melding";

/** Understoettede sprog. Groenlandsk og faeroesk er strukturelle stubs i Fase 1. */
export type LanguageCode = "da" | "kl" | "fo";

export type ThemeMode = "light" | "dark";

/** Metadata om en blankettype, brugt til forsidens knapper og formularskaller. */
export interface FormDefinition {
  kind: FormKind;
  /** Reference til i18n string-ID, ikke rå tekst. */
  titleId: string;
  /** Reference til i18n string-ID for kort forklaring i formularskallen. */
  descriptionId: string;
  /** Reference til i18n string-ID for den formular-specifikke demomaerkning. */
  disclaimerId: string;
  /** Farve-accent for knap/mærkning, hvor relevant (fx MAYDAY/PAN-PAN bruges kun inde i SAR). */
  accent?: "default" | "mayday" | "pan-pan" | "warning";
}

/** Simpelt applikations-navigationsstadie. Udvides i senere faser (kladder, historik). */
export type AppView = "home" | FormKind;
