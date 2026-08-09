import type { FieldSection, FormValues } from "../../types";
import { gpsField, coordinatesField, remarksField, mediaField } from "./common";

const isMayday = (v: FormValues) => v.messageType === "mayday";

export const SAR_SECTIONS: FieldSection[] = [
  {
    id: "type",
    titleId: "fields.sar.section.type",
    fields: [
      {
        id: "branch",
        labelId: "fields.sar.branch",
        type: "radio",
        required: true,
        options: [
          { value: "maritim", labelId: "fields.sar.branchChoice.maritim" },
          { value: "land", labelId: "fields.sar.branchChoice.land" },
          { value: "luft", labelId: "fields.sar.branchChoice.luft" },
        ],
      },
      {
        id: "messageType",
        labelId: "fields.sar.messageType",
        type: "radio",
        required: true,
        options: [
          { value: "mayday", labelId: "fields.sar.messageTypeChoice.mayday" },
          { value: "panpan", labelId: "fields.sar.messageTypeChoice.panpan" },
          { value: "observation", labelId: "fields.sar.messageTypeChoice.observation" },
        ],
      },
      {
        id: "maydayRelay",
        labelId: "fields.sar.maydayRelay",
        type: "checkbox",
        showWhen: isMayday,
      },
    ],
  },
  {
    id: "situation",
    titleId: "fields.sar.section.situation",
    fields: [
      { id: "whoInDistress", labelId: "fields.sar.whoInDistress", type: "textarea", required: true },
      { id: "personCount", labelId: "fields.sar.personCount", type: "text" },
      { id: "vesselIdentity", labelId: "fields.sar.vesselIdentity", type: "text" },
      { id: "whatHappened", labelId: "fields.sar.whatHappened", type: "textarea", required: true },
      gpsField,
      coordinatesField,
      { id: "lastKnownPosition", labelId: "fields.sar.lastKnownPosition", type: "text" },
      { id: "plannedRoute", labelId: "fields.sar.plannedRoute", type: "text" },
    ],
  },
  {
    id: "udstyr",
    titleId: "fields.sar.section.udstyr",
    fields: [
      { id: "distressSignals", labelId: "fields.sar.distressSignals", type: "text" },
      { id: "rescueEquipment", labelId: "fields.sar.rescueEquipment", type: "text" },
      { id: "supplies", labelId: "fields.sar.supplies", type: "text" },
      { id: "visibleFeatures", labelId: "fields.sar.visibleFeatures", type: "text" },
    ],
  },
  {
    id: "vejr",
    titleId: "fields.sar.section.vejr",
    fields: [
      { id: "weather", labelId: "fields.sar.weather", type: "text" },
      { id: "assistanceRequested", labelId: "fields.sar.assistanceRequested", type: "textarea", required: true },
    ],
  },
  {
    id: "supplerende",
    titleId: "fields.sar.section.supplerende",
    fields: [remarksField, mediaField],
  },
];
