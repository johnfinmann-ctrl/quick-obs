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
      </label>
      <PendingTranslationNote show={label.isPendingApproval} />
      {help && (
        <>
          <p className={styles.help}>{help.text}</p>
          <PendingTranslationNote show={help.isPendingApproval} />
        </>
      )}
      {children}
    </div>
  );
}
