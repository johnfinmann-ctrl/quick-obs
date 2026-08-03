import type { FormDefinition } from "../types";
import { useTranslation } from "../i18n";
import styles from "./DisclaimerBadge.module.css";

const ACCENT_CLASS: Record<NonNullable<FormDefinition["accent"]>, string> = {
  default: styles.default,
  warning: styles.warning,
  "pan-pan": styles.panPan,
  mayday: styles.mayday,
};

export function DisclaimerBadge({ form }: { form: FormDefinition }) {
  const { t } = useTranslation();
  const accentClass = ACCENT_CLASS[form.accent ?? "default"];

  return (
    <p className={`${styles.badge} ${accentClass}`} role="note">
      {t(form.disclaimerId)}
    </p>
  );
}
