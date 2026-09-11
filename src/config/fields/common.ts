import type { FieldDefinition } from "../../types";

/** Felter der gaar igen paa tvaers af flere blanketter. */
export const senderCallsignField: FieldDefinition = {
  id: "senderCallsign",
  labelId: "fields.common.senderCallsign",
  type: "text",
  required: true,
};

export const dtgField: FieldDefinition = {
  id: "dtg",
  labelId: "fields.common.dtg",
  type: "datetime",
  required: true,
  helpId: "fields.common.dtgHelp",
};

export const gpsField: FieldDefinition = {
  id: "gpsPosition",
  labelId: "fields.common.gpsPosition",
  type: "gps",
  helpId: "fields.common.gpsHelp",
};

export const coordinatesField: FieldDefinition = {
  id: "coordinates",
  labelId: "fields.common.coordinates",
  type: "text",
  helpId: "fields.common.coordinatesHelp",
};

export const mgrsField: FieldDefinition = {
  id: "mgrs",
  labelId: "fields.common.mgrs",
  type: "mgrs",
};

export const remarksField: FieldDefinition = {
  id: "remarks",
  labelId: "fields.common.remarks",
  type: "textarea",
};

export const mediaField: FieldDefinition = {
  id: "media",
  labelId: "fields.common.media",
  type: "media",
};

export const ownActionField: FieldDefinition = {
  id: "ownAction",
  labelId: "fields.common.ownAction",
  type: "textarea",
};
