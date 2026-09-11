import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";
import styles from "./FormButton.module.css";

interface FormButtonProps {
  titleId: string;
  Icon: LucideIcon;
  onSelect: () => void;
  /** Modulfarve (hex). Falder tilbage til standard-groen, hvis ikke angivet. */
  color?: string;
  /** Fremhaevet modul (admin-valgt "startmodul"/fremhaevet) - faar en tydelig ramme. */
  highlighted?: boolean;
}

/**
 * Stor, mobil-venlig knap til valg af blankettype paa forsiden.
 * Opfylder minimum 56x56 px beroeringsflade og har tydelig fokusmarkering.
 * Farven identificerer modulet (jf. Fase 2.1's modulfarvepalette) og er
 * altid suppleret med ikon og tekst - farve alene baerer ingen betydning.
 */
export function FormButton({ titleId, Icon, onSelect, color, highlighted }: FormButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onSelect}
      style={{
        background: color ?? undefined,
        outline: highlighted ? "3px solid var(--qo-color-warning)" : undefined,
        outlineOffset: highlighted ? "2px" : undefined,
      }}
    >
      <Icon aria-hidden="true" className={styles.icon} size={28} strokeWidth={2.25} />
      <span className={styles.label}>{t(titleId)}</span>
    </button>
  );
}
