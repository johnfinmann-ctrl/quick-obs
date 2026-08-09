import { type ReactNode, useState } from "react";
import type { FieldSection, FormDefinition, Report } from "../types";
import { useTranslation } from "../i18n/useTranslation";
import type { UseFormDraftResult } from "../hooks/useFormDraft";
import { BackButton } from "./BackButton";
import { DisclaimerBadge } from "./DisclaimerBadge";
import { PendingTranslationNote } from "./PendingTranslationNote";
import { FormRenderer } from "./FormRenderer";
import { ExportBar } from "./ExportBar";
import { buildReportText, buildSitrepText, valuesLookAsSensitive } from "../utils/reportText";
import styles from "./FormPage.module.css";

interface FormPageProps {
  form: FormDefinition;
  sections: FieldSection[];
  draft: UseFormDraftResult;
  onBack: () => void;
  /** Ekstra UI mellem sektionerne og gem-knappen (fx MIPRE-generator, MIST-kobling). */
  extraContent?: ReactNode;
  /** Kaldes efter en vellykket gemning, saa en formular kan tilbyde opfoelgende handlinger. */
  onSaved?: (report: Report) => void;
}

/**
 * Faelles skal for de fem udfyldelige blanketter: titel, demomaerkning,
 * konfigurationsstyrede felter, gem/kladde-status og eksport.
 */
export function FormPage({ form, sections, draft, onBack, extraContent, onSaved }: FormPageProps) {
  const { tResolved, t } = useTranslation();
  const title = tResolved(form.titleId);
  const description = tResolved(form.descriptionId);
  const [savedReport, setSavedReport] = useState<Report | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!draft.loaded) {
    return (
      <div className={styles.container}>
        <BackButton onClick={onBack} />
      </div>
    );
  }

  async function handleSave() {
    const missing = sections
      .flatMap((s) => s.fields)
      .filter((f) => f.required && (!f.showWhen || f.showWhen(draft.values)))
      .filter((f) => {
        const v = draft.values[f.id];
        return v === undefined || v === null || v === "";
      });

    if (missing.length > 0) {
      setValidationError(t("formPage.missingRequired"));
      return;
    }
    setValidationError(null);
    const report = await draft.saveAsReport();
    setSavedReport(report);
    onSaved?.(report);
  }

  const activeReport: Report | null = savedReport;

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <BackButton onClick={onBack} />
      </div>

      <div>
        <h1 className={styles.title}>{title.text}</h1>
        <PendingTranslationNote show={title.isPendingApproval} />
      </div>
      <div>
        <p className={styles.description}>{description.text}</p>
        <PendingTranslationNote show={description.isPendingApproval} />
      </div>

      <DisclaimerBadge form={form} />

      {draft.lastSavedAt && !activeReport && (
        <p className={styles.autosaveStatus}>
          {t("formPage.draftSavedAt")} {new Date(draft.lastSavedAt).toLocaleTimeString("da-DK")}
        </p>
      )}

      <FormRenderer
        sections={sections}
        values={draft.values}
        onChange={draft.setField}
        mediaIds={draft.mediaIds}
        onMediaChange={draft.setMediaIds}
      />

      {extraContent}

      {validationError && <p style={{ color: "var(--qo-color-mayday)" }}>{validationError}</p>}

      {activeReport ? (
        <>
          <p className={styles.savedBanner}>{t("formPage.saved")}</p>
          <ExportBar
            title={`${title.text} - ${activeReport.id}`}
            buildText={() =>
              form.kind === "sitrep"
                ? buildSitrepText(activeReport, sections, t, title.text)
                : buildReportText(activeReport, sections, t, title.text)
            }
            sensitive={valuesLookAsSensitive(activeReport.values)}
          />
        </>
      ) : (
        <div className={styles.actionsRow}>
          <button type="button" className={styles.saveButton} onClick={handleSave}>
            {t("formPage.save")}
          </button>
          <button type="button" className={styles.discardButton} onClick={() => draft.discardDraft()}>
            {t("formPage.discard")}
          </button>
        </div>
      )}
    </div>
  );
}
