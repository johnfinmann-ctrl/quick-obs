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
