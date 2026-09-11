import type { FormDefinition } from "../types";

/**
 * Konfigurationsstyret liste over hovedblanketterne.
 *
 * Dette er metadata til forsiden, formularskaller og Blanketbiblioteket.
 * De faktiske feltdefinitioner ligger i separate konfigurationsfiler
 * (src/config/fields/*.ts), saa komponenterne ikke skal omskrives, naar
 * det faglige indhold aendres. `active` og `sortOrder` kan justeres i
 * Administration -> Blanketbibliotek uden at aendre denne fil.
 */
export const FORM_DEFINITIONS: FormDefinition[] = [
  {
    kind: "hurtig-rapport",
    moduleColor: "#2E8B3D",
    titleId: "forms.hurtigRapport.title",
    descriptionId: "forms.hurtigRapport.description",
    disclaimerId: "forms.hurtigRapport.disclaimer",
    accent: "default",
    version: "0.1.0",
    status: "demo",
    lastReview: "2026-08-04",
    active: true,
    sortOrder: 0,
  },
  {
    kind: "meldingsblanket",
    moduleColor: "#2D4A27",
    titleId: "forms.meldingsblanket.title",
    descriptionId: "forms.meldingsblanket.description",
    disclaimerId: "forms.meldingsblanket.disclaimer",
    accent: "default",
    version: "0.2.0",
    status: "demo",
    lastReview: "2026-08-04",
    active: true,
    sortOrder: 1,
  },
  {
    kind: "sitrep",
    moduleColor: "#1B3A5C",
    titleId: "forms.sitrep.title",
    descriptionId: "forms.sitrep.description",
    disclaimerId: "forms.sitrep.disclaimer",
    accent: "default",
    version: "0.1.0",
    status: "demo",
    lastReview: "2026-08-04",
    active: true,
    sortOrder: 2,
  },
  {
    kind: "nine-liner",
    moduleColor: "#6B1F2A",
    titleId: "forms.nineLiner.title",
    descriptionId: "forms.nineLiner.description",
    disclaimerId: "forms.nineLiner.disclaimer",
    accent: "default",
    version: "0.2.0",
    status: "udkast",
    lastReview: "2026-08-04",
    active: true,
    sortOrder: 3,
  },
  {
    kind: "mist",
    moduleColor: "#6B1F2A",
    titleId: "forms.mist.title",
    descriptionId: "forms.mist.description",
    disclaimerId: "forms.mist.disclaimer",
    accent: "default",
    version: "0.2.0",
    status: "udkast",
    lastReview: "2026-08-04",
    active: true,
    sortOrder: 4,
  },
  {
    kind: "dronemelding",
    moduleColor: "#3B6E71",
    titleId: "forms.dronemelding.title",
    descriptionId: "forms.dronemelding.description",
    disclaimerId: "forms.dronemelding.disclaimer",
    accent: "warning",
    version: "0.2.0",
    status: "udkast",
    lastReview: "2026-08-04",
    active: true,
    sortOrder: 5,
  },
  {
    kind: "sar-melding",
    moduleColor: "#B3261E",
    titleId: "forms.sarMelding.title",
    descriptionId: "forms.sarMelding.description",
    disclaimerId: "forms.sarMelding.disclaimer",
    accent: "mayday",
    version: "0.2.0",
    status: "udkast",
    lastReview: "2026-08-04",
    active: true,
    sortOrder: 6,
  },
];
