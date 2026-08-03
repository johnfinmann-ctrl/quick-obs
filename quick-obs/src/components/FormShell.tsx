import type { FormDefinition } from "../types";
import { useTranslation } from "../i18n";
import { BackButton } from "./BackButton";
import { DisclaimerBadge } from "./DisclaimerBadge";
import { PendingTranslationNote } from "./PendingTranslationNote";
import styles from "./FormShell.module.css";

interface FormShellProps {
  form: FormDefinition;
  onBack: () => void;
}

/**
 * Tom formularskal for Fase 1.
 *
 * Viser blanketnavn, den formular-specifikke demomaerkning og en kort
 * forklaring. De faktiske felter (konfigurationsstyrede) tilfoejes i
 * Fase 2 uden at denne skal-komponent skal omskrives.
 */
export function FormShell({ form, onBack }: FormShellProps) {
  const { tResolved } = useTranslation();
  const title = tResolved(form.titleId);
  const description = tResolved(form.descriptionId);

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

      <div className={styles.placeholder}>{tResolved("formShell.placeholder").text}</div>
    </div>
  );
}
