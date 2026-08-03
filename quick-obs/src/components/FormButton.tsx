import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../i18n";
import styles from "./FormButton.module.css";

interface FormButtonProps {
  titleId: string;
  Icon: LucideIcon;
  onSelect: () => void;
}

/**
 * Stor, mobil-venlig knap til valg af blankettype paa forsiden.
 * Opfylder minimum 56x56 px beroeringsflade og har tydelig fokusmarkering.
 */
export function FormButton({ titleId, Icon, onSelect }: FormButtonProps) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.button} onClick={onSelect}>
      <Icon aria-hidden="true" className={styles.icon} size={28} strokeWidth={2.25} />
      <span className={styles.label}>{t(titleId)}</span>
    </button>
  );
}
