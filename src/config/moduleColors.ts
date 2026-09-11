/**
 * Fast, tilgaengelig farvepalette for Fase 2.1-moduler, der ikke er
 * almindelige udfyldelige blanketter (og derfor ikke har en
 * FormDefinition.moduleColor). Blanketternes egne farver ligger i
 * config/forms.ts.
 */
export const MODULE_COLORS = {
  droneSurveillance: "#1F4B4D",
  formLibrary: "#9C7A2E",
  history: "#5B6660",
  mediaAccent: "#0F9B8E",
} as const;
