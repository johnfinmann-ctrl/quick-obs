import type { FieldSection, FormValues } from "../../types";
import { dtgField, gpsField, coordinatesField, remarksField, mediaField } from "./common";
import {
  PRECEDENCE_OPTIONS,
  SPECIAL_EQUIPMENT_OPTIONS,
  SECURITY_OPTIONS_WARTIME,
  MARKING_OPTIONS,
  NATIONALITY_OPTIONS,
  CBRN_OPTIONS,
} from "../nineLinerConfig";

const isWartime = (values: FormValues) => values.situation === "wartime";
const isPeacetime = (values: FormValues) => values.situation !== "wartime";

export const NINE_LINER_SECTIONS: FieldSection[] = [
  {
    id: "grundlag",
    titleId: "fields.nineLiner.section.grundlag",
    fields: [
      {
        id: "situation",
        labelId: "fields.nineLiner.situation",
        type: "radio",
        required: true,
        options: [
          { value: "peacetime", labelId: "fields.nineLiner.situationChoice.peacetime" },
          { value: "wartime", labelId: "fields.nineLiner.situationChoice.wartime" },
        ],
      },
      { id: "senderCallsign", labelId: "fields.common.senderCallsign", type: "text", required: true },
      { id: "radioFrequency", labelId: "fields.nineLiner.radioFrequency", type: "text" },
      dtgField,
    ],
  },
  {
    id: "foerste-del",
    titleId: "fields.nineLiner.section.foersteDel",
    fields: [
      gpsField,
      coordinatesField,
      { id: "callSignSuffix", labelId: "fields.nineLiner.callSignSuffix", type: "text" },
      { id: "precedence", labelId: "fields.nineLiner.precedence", type: "select", options: PRECEDENCE_OPTIONS, required: true },
      { id: "specialEquipment", labelId: "fields.nineLiner.specialEquipment", type: "select", options: SPECIAL_EQUIPMENT_OPTIONS },
      { id: "patientsLitter", labelId: "fields.nineLiner.patientsLitter", type: "text" },
      { id: "patientsAmbulatory", labelId: "fields.nineLiner.patientsAmbulatory", type: "text" },
    ],
  },
  {
    id: "supplerende-del",
    titleId: "fields.nineLiner.section.supplerendeDel",
    fields: [
      {
        id: "securityWartime",
        labelId: "fields.nineLiner.securityWartime",
        type: "select",
        options: SECURITY_OPTIONS_WARTIME,
        showWhen: isWartime,
      },
      {
        id: "woundDescriptionPeacetime",
        labelId: "fields.nineLiner.woundDescriptionPeacetime",
        type: "textarea",
        showWhen: isPeacetime,
      },
      { id: "markingMethod", labelId: "fields.nineLiner.markingMethod", type: "select", options: MARKING_OPTIONS },
      { id: "nationalityStatus", labelId: "fields.nineLiner.nationalityStatus", type: "select", options: NATIONALITY_OPTIONS },
      {
        id: "cbrnWartime",
        labelId: "fields.nineLiner.cbrnWartime",
        type: "select",
        options: CBRN_OPTIONS,
        showWhen: isWartime,
      },
      {
        id: "terrainPeacetime",
        labelId: "fields.nineLiner.terrainPeacetime",
        type: "textarea",
        showWhen: isPeacetime,
      },
    ],
  },
  {
    id: "supplerende",
    titleId: "fields.nineLiner.section.supplerende",
    fields: [remarksField, mediaField],
  },
];
