import { useEffect, useState } from "react";
import { useFormDraft } from "../../hooks/useFormDraft";
import { FormPage } from "../FormPage";
import { SITREP_SECTIONS } from "../../config/fields/sitrep";
import { FORM_DEFINITIONS } from "../../config/forms";
import { useTranslation } from "../../i18n/useTranslation";
import { listReports } from "../../storage/reports";
import type { Report } from "../../types";
import { FieldWrapper } from "../fields/FieldWrapper";
import { fieldStyles as styles } from "../fields/fieldSharedStyles";

const FORM = FORM_DEFINITIONS.find((f) => f.kind === "sitrep")!;

/**
 * SITREP kan samle udvalgte eksisterende rapporter (og dermed deres
 * positioner og medier) via et flervalg, hentet dynamisk fra historikken.
 */
export function SitrepForm({ onBack }: { onBack: () => void }) {
  const draft = useFormDraft("sitrep");
  const { t } = useTranslation();
  const [allReports, setAllReports] = useState<Report[]>([]);

  useEffect(() => {
    listReports().then((all) => setAllReports(all.filter((r) => r.kind !== "sitrep")));
  }, []);

  const linkedIds: string[] = Array.isArray(draft.values.linkedReportIds)
    ? (draft.values.linkedReportIds as string[])
    : [];

  function toggleLinked(id: string) {
    const next = linkedIds.includes(id) ? linkedIds.filter((x) => x !== id) : [...linkedIds, id];
    draft.setField("linkedReportIds", next);
  }

  return (
    <FormPage
      form={FORM}
      sections={SITREP_SECTIONS}
      draft={draft}
      onBack={onBack}
      extraContent={
        draft.loaded ? (
          <FieldWrapper labelId="fields.sitrep.linkedReports" helpId="fields.sitrep.linkedReportsHelp">
            {allReports.length === 0 && <p className={styles.help}>{t("fields.sitrep.noReports")}</p>}
            <div className={styles.checkboxGroup}>
              {allReports.map((r) => (
                <label key={r.id} className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    checked={linkedIds.includes(r.id)}
                    onChange={() => toggleLinked(r.id)}
                  />
                  {r.title} - {new Date(r.updatedAt).toLocaleDateString("da-DK")}
                  {r.mediaIds.length > 0 ? ` (${r.mediaIds.length} media)` : ""}
                </label>
              ))}
            </div>
          </FieldWrapper>
        ) : null
      }
    />
  );
}
