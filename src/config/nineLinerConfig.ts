import type { FieldOption } from "../types";

/**
 * 9-Liner koder og valgmuligheder - konfigurationsstyret, saa de kan
 * justeres uden at aendre selve formularkomponenten.
 *
 * Koderne foelger det offentligt kendte, generiske 9-Liner MEDEVAC-format,
 * som ogsaa indgaar i civil TCCC-undervisning. De er IKKE automatisk
 * danske eller NATO-godkendte kategorier - se advarslen vist i formularen.
 * Lokalt godkendte procedurer og koder har altid forrang.
 */

export const PRECEDENCE_OPTIONS: FieldOption[] = [
  { value: "A", labelId: "nineLiner.codes.precedence.A" },
  { value: "B", labelId: "nineLiner.codes.precedence.B" },
  { value: "C", labelId: "nineLiner.codes.precedence.C" },
  { value: "D", labelId: "nineLiner.codes.precedence.D" },
  { value: "E", labelId: "nineLiner.codes.precedence.E" },
];

export const SPECIAL_EQUIPMENT_OPTIONS: FieldOption[] = [
  { value: "A", labelId: "nineLiner.codes.equipment.A" },
  { value: "B", labelId: "nineLiner.codes.equipment.B" },
  { value: "C", labelId: "nineLiner.codes.equipment.C" },
  { value: "D", labelId: "nineLiner.codes.equipment.D" },
];

export const SECURITY_OPTIONS_WARTIME: FieldOption[] = [
  { value: "N", labelId: "nineLiner.codes.security.N" },
  { value: "P", labelId: "nineLiner.codes.security.P" },
  { value: "E", labelId: "nineLiner.codes.security.E" },
  { value: "X", labelId: "nineLiner.codes.security.X" },
];

export const MARKING_OPTIONS: FieldOption[] = [
  { value: "A", labelId: "nineLiner.codes.marking.A" },
  { value: "B", labelId: "nineLiner.codes.marking.B" },
  { value: "C", labelId: "nineLiner.codes.marking.C" },
  { value: "D", labelId: "nineLiner.codes.marking.D" },
  { value: "E", labelId: "nineLiner.codes.marking.E" },
];

export const NATIONALITY_OPTIONS: FieldOption[] = [
  { value: "A", labelId: "nineLiner.codes.nationality.A" },
  { value: "B", labelId: "nineLiner.codes.nationality.B" },
  { value: "C", labelId: "nineLiner.codes.nationality.C" },
  { value: "D", labelId: "nineLiner.codes.nationality.D" },
  { value: "E", labelId: "nineLiner.codes.nationality.E" },
  { value: "F", labelId: "nineLiner.codes.nationality.F" },
];

export const CBRN_OPTIONS: FieldOption[] = [
  { value: "NONE", labelId: "nineLiner.codes.cbrn.none" },
  { value: "N", labelId: "nineLiner.codes.cbrn.N" },
  { value: "B", labelId: "nineLiner.codes.cbrn.B" },
  { value: "C", labelId: "nineLiner.codes.cbrn.C" },
  { value: "R", labelId: "nineLiner.codes.cbrn.R" },
];

export const OTHER_UNDETERMINED = "OTHER";
