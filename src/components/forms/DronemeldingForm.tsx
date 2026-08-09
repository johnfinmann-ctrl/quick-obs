import { useFormDraft } from "../../hooks/useFormDraft";
import { FormPage } from "../FormPage";
import { DRONEMELDING_SECTIONS } from "../../config/fields/dronemelding";
import { FORM_DEFINITIONS } from "../../config/forms";

const FORM = FORM_DEFINITIONS.find((f) => f.kind === "dronemelding")!;

export function DronemeldingForm({ onBack }: { onBack: () => void }) {
  const draft = useFormDraft("dronemelding");
  return <FormPage form={FORM} sections={DRONEMELDING_SECTIONS} draft={draft} onBack={onBack} />;
}
