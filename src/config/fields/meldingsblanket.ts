import type { FieldSection } from "../../types";
import {
  senderCallsignField,
  dtgField,
  gpsField,
  coordinatesField,
  remarksField,
  mediaField,
  ownActionField,
} from "./common";

export const MELDINGSBLANKET_SECTIONS: FieldSection[] = [
  {
    id: "afsender",
    titleId: "fields.meldingsblanket.section.afsender",
    fields: [
      senderCallsignField,
      { id: "receiver", labelId: "fields.meldingsblanket.receiver", type: "text" },
      dtgField,
    ],
  },
  {
    id: "indhold",
    titleId: "fields.meldingsblanket.section.indhold",
    fields: [
      { id: "who", labelId: "fields.meldingsblanket.who", type: "textarea" },
      { id: "what", labelId: "fields.meldingsblanket.what", type: "textarea" },
      { id: "where", labelId: "fields.meldingsblanket.where", type: "text" },
      { id: "when", labelId: "fields.meldingsblanket.when", type: "datetime" },
      { id: "how", labelId: "fields.meldingsblanket.how", type: "textarea" },
      { id: "assessment", labelId: "fields.meldingsblanket.assessment", type: "textarea" },
      ownActionField,
    ],
  },
  {
    id: "position",
    titleId: "fields.meldingsblanket.section.position",
    fields: [gpsField, coordinatesField],
  },
  {
    id: "supplerende",
    titleId: "fields.meldingsblanket.section.supplerende",
    fields: [remarksField, mediaField],
  },
];
