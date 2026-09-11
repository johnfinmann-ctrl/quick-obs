import { useFormDraft } from "../../hooks/useFormDraft";
import { FormPage } from "../FormPage";
import { SAR_SECTIONS } from "../../config/fields/sarMelding";
import { FORM_DEFINITIONS } from "../../config/forms";
import { useTranslation } from "../../i18n/useTranslation";
import { FieldWrapper } from "../fields/FieldWrapper";
import { fieldStyles as styles } from "../fields/fieldSharedStyles";
import { ContactsList } from "../ContactsList";
import type { ContactDomain } from "../../types";

const FORM = FORM_DEFINITIONS.find((f) => f.kind === "sar-melding")!;

function buildMipreText(values: Record<string, unknown>, t: (k: string) => string): string {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "-");

  const header =
    values.messageType === "mayday"
      ? `${values.maydayRelay ? "MAYDAY RELAY, MAYDAY RELAY, MAYDAY RELAY" : "MAYDAY, MAYDAY, MAYDAY"}`
      : values.messageType === "panpan"
        ? "PAN-PAN, PAN-PAN, PAN-PAN"
        : t("fields.sar.mipre.observationHeader");

  const lines = [
    header,
    `M (${t("fields.sar.mipre.m")}): ${str(values.whoInDistress)}`,
    `I (${t("fields.sar.mipre.i")}): ${str(values.whatHappened)}`,
    `P (${t("fields.sar.mipre.p")}): ${str(values.gpsPosition) !== "-" ? str(values.gpsPosition) : str(values.coordinates)}`,
    `R (${t("fields.sar.mipre.r")}): ${str(values.assistanceRequested)}`,
    `E (${t("fields.sar.mipre.e")}): ${str(values.remarks)}`,
    "OVER",
  ];

  return lines.join("\n");
}

export function SarMeldingForm({ onBack }: { onBack: () => void }) {
  const draft = useFormDraft("sar-melding");
  const { t } = useTranslation();

  const mipreText = typeof draft.values.mipreText === "string" ? draft.values.mipreText : "";
  const branch = typeof draft.values.branch === "string" ? (draft.values.branch as ContactDomain) : undefined;

  return (
    <FormPage
      form={FORM}
      sections={SAR_SECTIONS}
      draft={draft}
      onBack={onBack}
      beforeMedia={
        draft.loaded ? (
          <FieldWrapper labelId="contacts.title" helpId="fields.sar.emergencyBeforeMediaHelp">
            <ContactsList domainFilter={branch} />
          </FieldWrapper>
        ) : null
      }
      extraContent={
        draft.loaded ? (
          <FieldWrapper labelId="fields.sar.mipre.title" helpId="fields.sar.mipre.help">
            <button
              type="button"
              className={styles.smallButton}
              style={{ marginBottom: 8 }}
              onClick={() => draft.setField("mipreText", buildMipreText(draft.values, t))}
            >
              {t("fields.sar.mipre.generate")}
            </button>
            <textarea
              className={styles.input}
              style={{ minHeight: 160, fontFamily: "monospace" }}
              value={mipreText}
              onChange={(e) => draft.setField("mipreText", e.target.value)}
              placeholder={t("fields.sar.mipre.placeholder")}
            />
          </FieldWrapper>
        ) : null
      }
    />
  );
}
