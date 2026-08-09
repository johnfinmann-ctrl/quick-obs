import type { FieldSection } from "../../types";
import { remarksField, mediaField } from "./common";

export const MIST_SECTIONS: FieldSection[] = [
  {
    id: "identifikation",
    titleId: "fields.mist.section.identifikation",
    fields: [
      { id: "personId", labelId: "fields.mist.personId", type: "text", required: true },
    ],
  },
  {
    id: "mist",
    titleId: "fields.mist.section.mist",
    fields: [
      { id: "mechanism", labelId: "fields.mist.mechanism", type: "textarea" },
      { id: "injuryTime", labelId: "fields.mist.injuryTime", type: "datetime" },
      { id: "injury", labelId: "fields.mist.injury", type: "textarea" },
      {
        id: "consciousness",
        labelId: "fields.mist.consciousness",
        type: "select",
        options: [
          { value: "A", labelId: "fields.mist.consciousnessChoice.A" },
          { value: "V", labelId: "fields.mist.consciousnessChoice.V" },
          { value: "P", labelId: "fields.mist.consciousnessChoice.P" },
          { value: "U", labelId: "fields.mist.consciousnessChoice.U" },
        ],
      },
      { id: "pulse", labelId: "fields.mist.pulse", type: "text" },
      { id: "breathing", labelId: "fields.mist.breathing", type: "text" },
      { id: "bloodPressure", labelId: "fields.mist.bloodPressure", type: "text" },
      { id: "spo2", labelId: "fields.mist.spo2", type: "text" },
      { id: "temperature", labelId: "fields.mist.temperature", type: "text" },
      { id: "vitalsTime", labelId: "fields.mist.vitalsTime", type: "datetime" },
      { id: "treatmentGiven", labelId: "fields.mist.treatmentGiven", type: "textarea" },
      { id: "treatmentTime", labelId: "fields.mist.treatmentTime", type: "datetime" },
    ],
  },
  {
    id: "supplerende",
    titleId: "fields.mist.section.supplerende",
    fields: [remarksField, mediaField],
  },
];
