import { useFormDraft } from "../../hooks/useFormDraft";
import { FormPage } from "../FormPage";
import { MELDINGSBLANKET_SECTIONS } from "../../config/fields/meldingsblanket";
import { FORM_DEFINITIONS } from "../../config/forms";

const FORM = FORM_DEFINITIONS.find((f) => f.kind === "meldingsblanket")!;

export function MeldingsblanketForm({ onBack }: { onBack: () => void }) {
  const draft = useFormDraft("meldingsblanket");
  return <FormPage form={FORM} sections={MELDINGSBLANKET_SECTIONS} draft={draft} onBack={onBack} />;
}
