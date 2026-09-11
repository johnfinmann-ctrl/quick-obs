import { useState } from "react";
import { useFormDraft } from "../../hooks/useFormDraft";
import { FormPage } from "../FormPage";
import {
  DRONE_HURTIG_SECTIONS,
  DRONE_GRUNDIG_SECTIONS,
} from "../../config/fields/dronemelding";
import { FORM_DEFINITIONS } from "../../config/forms";
import { useTranslation } from "../../i18n/useTranslation";
import { BackButton } from "../BackButton";
import { DroneMilitaryIntro } from "../DroneMilitaryIntro";
import { LinkedObservations, type LinkedObservation } from "../fields/LinkedObservations";
import { FieldWrapper } from "../fields/FieldWrapper";
import { RadioDisplayView } from "../RadioDisplayView";
import { newIncidentId } from "../../utils/droneIncident";
import { buildDroneSitrepText } from "../../utils/droneToSitrep";
import { saveDraft } from "../../storage/drafts";
import { saveReport } from "../../storage/reports";
import type { Report } from "../../types";
import styles from "./DronemeldingForm.module.css";

const FORM = FORM_DEFINITIONS.find((f) => f.kind === "dronemelding")!;

interface DronemeldingFormProps {
  onBack: () => void;
  onViewIncident: (incidentId: string) => void;
  onNavigateToSitrep: () => void;
}

/**
 * Drone-Obs: to visninger af SAMME modul og datamodel (ikke to separate
 * apps) - Hurtig observation (faa sekunder, medie-foerst, minimalt) og
 * Grundig observation (systematisk dokumentation, udvidede felter).
 * "Fortsaet som grundig observation" genbruger den samme kladde/rapport,
 * saa allerede registrerede medier/GPS/tid/felter foelger automatisk med.
 */
export function DronemeldingForm({ onBack, onViewIncident, onNavigateToSitrep }: DronemeldingFormProps) {
  const draft = useFormDraft("dronemelding");
  const { t } = useTranslation();
  const [savedReport, setSavedReport] = useState<Report | null>(null);
  const [showRadio, setShowRadio] = useState(false);

  if (!draft.loaded) {
    return (
      <div className={styles.modeContainer}>
        <BackButton onClick={onBack} />
      </div>
    );
  }

  const mode = typeof draft.values.observationMode === "string" ? draft.values.observationMode : null;
  const hasExistingReport = typeof draft.values.__reportId === "string";

  // Ingen tilstand valgt endnu, ingen eksisterende rapport, og ingen lige-gemt rapport -> vis valget.
  // ("savedReport" tjekkes ogsaa her, fordi draft.values nulstilles til {} umiddelbart efter gemning.)
  if (!mode && !hasExistingReport && !savedReport) {
    return (
      <div className={styles.modeContainer}>
        <BackButton onClick={onBack} />
        <h1 className={styles.modeTitle}>{t("forms.dronemelding.title")}</h1>
        <DroneMilitaryIntro />
        <button type="button" className={styles.modeButton} onClick={() => draft.setField("observationMode", "hurtig")}>
          {t("drone.mode.hurtig")}
          <span className={styles.modeButtonSub}>{t("drone.mode.hurtigSub")}</span>
        </button>
        <button type="button" className={styles.modeButton} onClick={() => draft.setField("observationMode", "grundig")}>
          {t("drone.mode.grundig")}
          <span className={styles.modeButtonSub}>{t("drone.mode.grundigSub")}</span>
        </button>
      </div>
    );
  }

  // Gamle rapporter (foer denne funktion fandtes) mangler observationMode - vis dem som Grundig.
  // Efter gemning laeses tilstanden fra den gemte rapport (draft.values er nulstillet paa dette tidspunkt).
  const effectiveMode = savedReport
    ? (savedReport.values.observationMode === "hurtig" ? "hurtig" : "grundig")
    : mode === "hurtig"
      ? "hurtig"
      : "grundig";

  async function handleContinueGrundig() {
    if (!savedReport) return;
    await draft.loadReportIntoDraft(savedReport.id);
    draft.setField("observationMode", "grundig");
    setSavedReport(null);
  }

  async function handleSavedGrundig(report: Report) {
    let finalReport = report;
    if (!report.values.incidentId) {
      finalReport = { ...report, values: { ...report.values, incidentId: newIncidentId() } };
      await saveReport(finalReport);
    }
    setSavedReport(finalReport);
  }

  async function handleAddToIncident() {
    if (!savedReport) return;
    const incidentId = savedReport.values.incidentId as string;
    await saveDraft("dronemelding", { observationMode: "grundig", incidentId }, []);
    onBack(); // Naviger til forsiden - brugeren aabner Drone-Obs igen for den nye kladde
  }

  async function handleTransferToSitrep() {
    if (!savedReport) return;
    const text = buildDroneSitrepText(savedReport, t);
    await saveDraft("sitrep", { keyEvents: text, unit: typeof savedReport.values.observer === "string" ? savedReport.values.observer : "" }, savedReport.mediaIds);
    onNavigateToSitrep();
  }

  if (effectiveMode === "hurtig" && !savedReport) {
    return (
      <FormPage
        form={FORM}
        sections={DRONE_HURTIG_SECTIONS}
        draft={draft}
        onBack={onBack}
        onSaved={(report) => setSavedReport(report)}
      />
    );
  }

  if (effectiveMode === "hurtig" && savedReport) {
    return (
      <div className={styles.modeContainer}>
        <BackButton onClick={onBack} />
        <h1 className={styles.modeTitle}>{t("formPage.saved")}</h1>
        <div className={styles.actionsRow}>
          <button type="button" className={styles.actionButton} onClick={handleContinueGrundig}>
            {t("drone.continueGrundig")}
          </button>
          <button type="button" className={styles.actionButton} onClick={() => setShowRadio(true)}>
            {t("radio.show")}
          </button>
        </div>
        {showRadio && <RadioDisplayView report={savedReport} onClose={() => setShowRadio(false)} />}
      </div>
    );
  }

  // Grundig observation
  const linkedObservations: LinkedObservation[] = Array.isArray(draft.values.linkedObservations)
    ? (draft.values.linkedObservations as LinkedObservation[])
    : [];

  return (
    <>
      <FormPage
        form={FORM}
        sections={DRONE_GRUNDIG_SECTIONS}
        draft={draft}
        onBack={onBack}
        onSaved={handleSavedGrundig}
        beforeMedia={<DroneMilitaryIntro />}
        extraContent={
          <>
            <FieldWrapper labelId="drone.linkedObservations.title" helpId="drone.linkedObservations.help">
              <LinkedObservations value={linkedObservations} onChange={(v) => draft.setField("linkedObservations", v)} />
            </FieldWrapper>
            {savedReport && (
              <div className={styles.actionsRow}>
                <button type="button" className={styles.actionButton} onClick={handleAddToIncident}>
                  {t("drone.addToIncident")}
                </button>
                {typeof savedReport.values.incidentId === "string" && (
                  <button type="button" className={styles.actionButton} onClick={() => onViewIncident(savedReport.values.incidentId as string)}>
                    {t("drone.incident.view")}
                  </button>
                )}
                <button type="button" className={styles.actionButton} onClick={handleTransferToSitrep}>
                  {t("drone.transferToSitrep")}
                </button>
                <button type="button" className={styles.actionButton} onClick={() => setShowRadio(true)}>
                  {t("radio.show")}
                </button>
              </div>
            )}
          </>
        }
      />
      {showRadio && savedReport && <RadioDisplayView report={savedReport} onClose={() => setShowRadio(false)} />}
    </>
  );
}
