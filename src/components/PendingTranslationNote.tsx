import { useTranslation } from "../i18n/useTranslation";
import styles from "./PendingTranslationNote.module.css";

/**
 * Meget diskret markoer (ikke en gentaget saetning) ved et konkret felt,
 * der falder tilbage til dansk. Den samlede forklaring ("oversaettelses-
 * udkast" / "mangler oversaettelse") vises kun ÉN gang, i det permanente
 * sprogstatusbanner oeverst (LanguageStatusBanner) - jf. Fase 2.1, punkt
 * 14: "Fjern den gentagne oversaettelsesbesked under hvert felt."
 */
export function PendingTranslationNote({ show }: { show: boolean }) {
  const { t } = useTranslation();
  if (!show) return null;
  return (
    <span className={styles.marker} title={t("i18n.pendingApproval")} aria-label={t("i18n.pendingApproval")}>
      (DA)
    </span>
  );
}
