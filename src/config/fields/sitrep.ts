import type { FieldSection } from "../../types";
import { dtgField, remarksField, mediaField } from "./common";

export const SITREP_SECTIONS: FieldSection[] = [
  {
    id: "grundlag",
    titleId: "fields.sitrep.section.grundlag",
    fields: [
      { id: "reportNumber", labelId: "fields.sitrep.reportNumber", type: "text" },
      { id: "unit", labelId: "fields.sitrep.unit", type: "text", required: true },
      { id: "period", labelId: "fields.sitrep.period", type: "text" },
      dtgField,
    ],
  },
  {
    id: "situation",
    titleId: "fields.sitrep.section.situation",
    fields: [
      { id: "overallSituation", labelId: "fields.sitrep.overallSituation", type: "textarea", required: true },
      { id: "keyEvents", labelId: "fields.sitrep.keyEvents", type: "textarea" },
      { id: "ownStatus", labelId: "fields.sitrep.ownStatus", type: "textarea" },
    ],
  },
  {
    id: "ressourcer",
    titleId: "fields.sitrep.section.ressourcer",
    fields: [
      { id: "personnel", labelId: "fields.sitrep.personnel", type: "textarea" },
      { id: "materiel", labelId: "fields.sitrep.materiel", type: "textarea" },
      { id: "logistics", labelId: "fields.sitrep.logistics", type: "textarea" },
      { id: "communications", labelId: "fields.sitrep.communications", type: "textarea" },
      { id: "weatherTerrain", labelId: "fields.sitrep.weatherTerrain", type: "textarea" },
    ],
  },
  {
    id: "fremad",
    titleId: "fields.sitrep.section.fremad",
    fields: [
      { id: "resourceNeeds", labelId: "fields.sitrep.resourceNeeds", type: "textarea" },
      { id: "expectedDevelopment", labelId: "fields.sitrep.expectedDevelopment", type: "textarea" },
      { id: "plannedActions", labelId: "fields.sitrep.plannedActions", type: "textarea" },
      { id: "decisionPoints", labelId: "fields.sitrep.decisionPoints", type: "textarea" },
    ],
  },
  {
    id: "supplerende",
    titleId: "fields.sitrep.section.supplerende",
    fields: [remarksField, mediaField],
  },
];
