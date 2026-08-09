import { useState } from "react";
import { useFormDraft } from "../../hooks/useFormDraft";
import { FormPage } from "../FormPage";
import { NINE_LINER_SECTIONS } from "../../config/fields/nineLiner";
import { FORM_DEFINITIONS } from "../../config/forms";
import { useTranslation } from "../../i18n/useTranslation";
import { saveDraft } from "../../storage/drafts";
import type { Report } from "../../types";

const FORM = FORM_DEFINITIONS.find((f) => f.kind === "nine-liner")!;

interface NineLinerFormProps {
  onBack: () => void;
  onCreateLinkedMist: (nineLinerReportId: string) => void;
}

/**
 * 9-Liner-formularen. Fred/krig-variantlogikken (linje 6 og 9) haandteres
 * via showWhen i feltkonfigurationen. Efter gemning kan brugeren vaelge at
 * oprette en tilknyttet MIST-rapport for en tilskadekommen.
 */
export function NineLinerForm({ onBack, onCreateLinkedMist }: NineLinerFormProps) {
  const draft = useFormDraft("nine-liner");
  const { t } = useTranslation();
  const [savedReport, setSavedReport] = useState<Report | null>(null);

  async function handleCreateMist() {
    if (!savedReport) return;
    await saveDraft("mist", { linkedNineLiner: savedReport.id }, []);
    onCreateLinkedMist(savedReport.id);
  }

  return (
    <FormPage
      form={FORM}
      sections={NINE_LINER_SECTIONS}
      draft={draft}
      onBack={onBack}
      onSaved={(report) => setSavedReport(report)}
      extraContent={
        <>
          <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>{t("fields.nineLiner.localProcedureNotice")}</p>
          {savedReport && (
            <button
              type="button"
              onClick={handleCreateMist}
              style={{
                minHeight: 56,
                padding: "0 16px",
                borderRadius: 12,
                border: "2px solid var(--qo-color-heading)",
                background: "transparent",
                color: "var(--qo-color-heading)",
                fontWeight: 700,
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              {t("fields.nineLiner.createLinkedMist")}
            </button>
          )}
        </>
      }
    />
  );
}
