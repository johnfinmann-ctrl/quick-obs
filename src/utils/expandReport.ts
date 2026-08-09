import type { FormKind, FormValues } from "../types";

/**
 * Overfoerer relevante felter fra en Hurtig rapport til en ny kladde for
 * en af de andre blanketter, saa brugeren ikke skal indtaste de samme
 * grundoplysninger igen. Kun overlappende, meningsfulde felter kopieres -
 * resten af maalblankettens felter forbliver tomme til udfyldelse.
 */
export function expandHurtigRapport(
  values: FormValues,
  target: Exclude<FormKind, "hurtig-rapport">,
): FormValues {
  const shared = {
    dtg: values.dtg,
    gpsPosition: values.gpsPosition,
    coordinates: values.coordinates,
  };

  switch (target) {
    case "meldingsblanket":
      return {
        ...shared,
        senderCallsign: values.observer,
        what: values.whatHappened,
        remarks: values.shortNote,
      };
    case "dronemelding":
      return {
        ...shared,
        observer: values.observer,
        remarks: values.shortNote,
      };
    case "sitrep":
      return {
        dtg: values.dtg,
        unit: values.observer,
        overallSituation: values.whatHappened,
        remarks: values.shortNote,
      };
    case "sar-melding":
      return {
        ...shared,
        whatHappened: values.whatHappened,
        remarks: values.shortNote,
      };
    case "nine-liner":
      return {
        senderCallsign: values.observer,
        dtg: values.dtg,
        gpsPosition: values.gpsPosition,
        coordinates: values.coordinates,
      };
    case "mist":
      return {};
    default:
      return {};
  }
}

export const EXPANDABLE_TARGETS: { kind: Exclude<FormKind, "hurtig-rapport">; labelId: string }[] = [
  { kind: "meldingsblanket", labelId: "forms.meldingsblanket.title" },
  { kind: "dronemelding", labelId: "forms.dronemelding.title" },
  { kind: "sitrep", labelId: "forms.sitrep.title" },
  { kind: "sar-melding", labelId: "forms.sarMelding.title" },
];
