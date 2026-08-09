import { useState } from "react";
import { useFormDraft } from "../../hooks/useFormDraft";
import { FormPage } from "../FormPage";
import { HURTIG_RAPPORT_SECTIONS } from "../../config/fields/hurtigRapport";
import { FORM_DEFINITIONS } from "../../config/forms";
import { useTranslation } from "../../i18n/useTranslation";
import { saveDraft } from "../../storage/drafts";
import { expandHurtigRapport, EXPANDABLE_TARGETS } from "../../utils/expandReport";
import type { FormKind, Report } from "../../types";
import { fieldStyles as styles } from "../fields/fieldSharedStyles";

const FORM = FORM_DEFINITIONS.find((f) => f.kind === "hurtig-rapport")!;

interface HurtigRapportFormProps {
  onBack: () => void;
  onExpand: (target: FormKind) => void;
}

/**
 * Hurtig rapport: minimalt sagt "en observation paa 30 sekunder". Efter
 * gemning kan brugeren udvide til en af de andre blanketter uden at
 * indtaste de samme grundoplysninger (DTG/GPS/observatoer/bemaerkning)
 * igen - se src/utils/expandReport.ts.
 */
export function HurtigRapportForm({ onBack, onExpand }: HurtigRapportFormProps) {
  const draft = useFormDraft("hurtig-rapport");
  const { t } = useTranslation();
  const [savedReport, setSavedReport] = useState<Report | null>(null);

  async function handleExpand(target: (typeof EXPANDABLE_TARGETS)[number]["kind"]) {
    if (!savedReport) return;
    const expandedValues = expandHurtigRapport(savedReport.values, target);
    await saveDraft(target, expandedValues, savedReport.mediaIds);
    onExpand(target);
  }

  return (
    <FormPage
      form={FORM}
      sections={HURTIG_RAPPORT_SECTIONS}
      draft={draft}
      onBack={onBack}
      onSaved={(report) => setSavedReport(report)}
      extraContent={
        savedReport && (
          <div>
            <p style={{ fontWeight: 700, margin: "0 0 8px" }}>{t("fields.hurtigRapport.expandTo")}</p>
            <div className={styles.row}>
              {EXPANDABLE_TARGETS.map((target) => (
                <button
                  key={target.kind}
                  type="button"
                  className={styles.smallButton}
                  onClick={() => handleExpand(target.kind)}
                >
                  {t(target.labelId)}
                </button>
              ))}
            </div>
          </div>
        )
      }
    />
  );
}
