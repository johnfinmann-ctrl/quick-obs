import { useEffect, useState } from "react";
import { useFormDraft } from "../../hooks/useFormDraft";
import { FormPage } from "../FormPage";
import { MIST_SECTIONS } from "../../config/fields/mist";
import { FORM_DEFINITIONS } from "../../config/forms";
import { useTranslation } from "../../i18n/useTranslation";
import { listReports } from "../../storage/reports";
import type { Report } from "../../types";
import { fieldStyles as styles } from "../fields/fieldSharedStyles";
import { FieldWrapper } from "../fields/FieldWrapper";

const FORM = FORM_DEFINITIONS.find((f) => f.kind === "mist")!;

export function MistForm({ onBack }: { onBack: () => void }) {
  const draft = useFormDraft("mist");
  const { t } = useTranslation();
  const [nineLiners, setNineLiners] = useState<Report[]>([]);

  useEffect(() => {
    listReports().then((all) => setNineLiners(all.filter((r) => r.kind === "nine-liner")));
  }, []);

  const linkedValue = typeof draft.values.linkedNineLiner === "string" ? draft.values.linkedNineLiner : "";

  return (
    <FormPage
      form={FORM}
      sections={MIST_SECTIONS}
      draft={draft}
      onBack={onBack}
      beforeMedia={<p style={{ fontWeight: 700, color: "var(--qo-color-mayday)" }}>{t("fields.mist.emergencyBeforeMedia")}</p>}
      extraContent={
        draft.loaded ? (
          <FieldWrapper labelId="fields.mist.linkedNineLiner" htmlFor="linkedNineLiner">
            <select
              id="linkedNineLiner"
              className={styles.input}
              value={linkedValue}
              onChange={(e) => draft.setField("linkedNineLiner", e.target.value)}
            >
              <option value="">{t("fields.mist.linkedNineLinerNone")}</option>
              {nineLiners.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} - {new Date(r.updatedAt).toLocaleDateString("da-DK")}
                </option>
              ))}
            </select>
          </FieldWrapper>
        ) : null
      }
    />
  );
}
