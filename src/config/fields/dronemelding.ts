import type { FieldSection } from "../../types";
import { dtgField, gpsField, coordinatesField, remarksField, mediaField } from "./common";

export const DRONEMELDING_SECTIONS: FieldSection[] = [
  {
    id: "observation",
    titleId: "fields.dronemelding.section.observation",
    fields: [
      dtgField,
      { id: "observer", labelId: "fields.dronemelding.observer", type: "text", required: true },
      gpsField,
      coordinatesField,
      { id: "lastKnownPosition", labelId: "fields.dronemelding.lastKnownPosition", type: "text" },
    ],
  },
  {
    id: "udseende",
    titleId: "fields.dronemelding.section.udseende",
    fields: [
      { id: "direction", labelId: "fields.dronemelding.direction", type: "text" },
      { id: "altitude", labelId: "fields.dronemelding.altitude", type: "text" },
      {
        id: "wingType",
        labelId: "fields.dronemelding.wingType",
        type: "radio",
        options: [
          { value: "fixed", labelId: "fields.dronemelding.wingTypeChoice.fixed" },
          { value: "multirotor", labelId: "fields.dronemelding.wingTypeChoice.multirotor" },
          { value: "unknown", labelId: "fields.dronemelding.wingTypeChoice.unknown" },
        ],
      },
      { id: "rotorCount", labelId: "fields.dronemelding.rotorCount", type: "text" },
      { id: "size", labelId: "fields.dronemelding.size", type: "text" },
      { id: "shape", labelId: "fields.dronemelding.shape", type: "text" },
      { id: "color", labelId: "fields.dronemelding.color", type: "text" },
      { id: "lights", labelId: "fields.dronemelding.lights", type: "text" },
      { id: "sound", labelId: "fields.dronemelding.sound", type: "text" },
    ],
  },
  {
    id: "adfaerd",
    titleId: "fields.dronemelding.section.adfaerd",
    fields: [
      { id: "behavior", labelId: "fields.dronemelding.behavior", type: "textarea" },
      { id: "visiblePayload", labelId: "fields.dronemelding.visiblePayload", type: "textarea" },
      { id: "distanceDirection", labelId: "fields.dronemelding.distanceDirection", type: "text" },
    ],
  },
  {
    id: "supplerende",
    titleId: "fields.dronemelding.section.supplerende",
    fields: [remarksField, mediaField],
  },
];
