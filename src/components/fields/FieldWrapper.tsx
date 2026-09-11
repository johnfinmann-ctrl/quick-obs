import type { ReactNode } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { PendingTranslationNote } from "../PendingTranslationNote";
import { fieldStyles as styles } from "./fieldSharedStyles";

interface FieldWrapperProps {
  labelId: string;
  helpId?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}

export function FieldWrapper({ labelId, helpId, required, htmlFor, children }: FieldWrapperProps) {
  const { tResolved } = useTranslation();
  const label = tResolved(labelId);
  const help = helpId ? tResolved(helpId) : null;

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label.text}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
        <PendingTranslationNote show={label.isPendingApproval} />
      </label>
      {help && (
        <p className={styles.help}>
          {help.text}
          <PendingTranslationNote show={help.isPendingApproval} />
        </p>
      )}
      {children}
    </div>
  );
}
