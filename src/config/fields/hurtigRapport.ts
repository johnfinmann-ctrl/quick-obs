import type { FieldSection } from "../../types";
import { dtgField, gpsField, coordinatesField, mediaField } from "./common";

export const HURTIG_RAPPORT_SECTIONS: FieldSection[] = [
  {
    id: "hurtig",
    titleId: "fields.hurtigRapport.section.hurtig",
    fields: [
      {
        id: "reportType",
        labelId: "fields.hurtigRapport.reportType",
        type: "select",
        options: [
          { value: "observation", labelId: "fields.hurtigRapport.reportTypeChoice.observation" },
          { value: "haendelse", labelId: "fields.hurtigRapport.reportTypeChoice.haendelse" },
          { value: "position", labelId: "fields.hurtigRapport.reportTypeChoice.position" },
          { value: "andet", labelId: "fields.hurtigRapport.reportTypeChoice.andet" },
        ],
        required: true,
      },
      { id: "whatHappened", labelId: "fields.hurtigRapport.whatHappened", type: "textarea", required: true },
      dtgField,
      gpsField,
      coordinatesField,
      { id: "observer", labelId: "fields.hurtigRapport.observer", type: "text" },
      {
        id: "priority",
        labelId: "fields.hurtigRapport.priority",
        type: "radio",
        options: [
          { value: "lav", labelId: "fields.hurtigRapport.priorityChoice.lav" },
          { value: "normal", labelId: "fields.hurtigRapport.priorityChoice.normal" },
          { value: "hoej", labelId: "fields.hurtigRapport.priorityChoice.hoej" },
          { value: "akut", labelId: "fields.hurtigRapport.priorityChoice.akut" },
        ],
      },
      { id: "shortNote", labelId: "fields.hurtigRapport.shortNote", type: "text" },
      mediaField,
    ],
  },
];
