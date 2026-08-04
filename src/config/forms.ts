import type { FormDefinition } from "../types";

/**
 * Konfigurationsstyret liste over de fem hovedblanketter.
 *
 * Dette er metadata til forsiden og formularskaller i Fase 1. De faktiske
 * feltdefinitioner (9-Liner fred/krig, MIST vitale vaerdier, osv.)
 * tilfoejes i Fase 2's formular-motor og laegges i separate
 * konfigurationsfiler (fx nineLinerConfig.ts), saa komponenterne ikke
 * skal omskrives, naar det faglige indhold aendres.
 */
export const FORM_DEFINITIONS: FormDefinition[] = [
  {
    kind: "meldingsblanket",
    titleId: "forms.meldingsblanket.title",
    descriptionId: "forms.meldingsblanket.description",
    disclaimerId: "forms.meldingsblanket.disclaimer",
    accent: "default",
  },
  {
    kind: "nine-liner",
    titleId: "forms.nineLiner.title",
    descriptionId: "forms.nineLiner.description",
    disclaimerId: "forms.nineLiner.disclaimer",
    accent: "default",
  },
  {
    kind: "mist",
    titleId: "forms.mist.title",
    descriptionId: "forms.mist.description",
    disclaimerId: "forms.mist.disclaimer",
    accent: "default",
  },
  {
    kind: "dronemelding",
    titleId: "forms.dronemelding.title",
    descriptionId: "forms.dronemelding.description",
    disclaimerId: "forms.dronemelding.disclaimer",
    accent: "warning",
  },
  {
    kind: "sar-melding",
    titleId: "forms.sarMelding.title",
    descriptionId: "forms.sarMelding.description",
    disclaimerId: "forms.sarMelding.disclaimer",
    accent: "mayday",
  },
];
