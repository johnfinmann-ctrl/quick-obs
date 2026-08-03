import { useTranslation } from "../i18n/useTranslation";
import styles from "./PendingTranslationNote.module.css";

/**
 * Diskret note vist under tekster, der falder tilbage til dansk, fordi en
 * fagligt godkendt oversaettelse til det valgte sprog endnu ikke findes.
 * Den raa "PENDING_NATIVE_TRANSLATION"-markoer vises aldrig her.
 */
export function PendingTranslationNote({ show }: { show: boolean }) {
  const { t } = useTranslation();
  if (!show) return null;
  return <p className={styles.note}>{t("i18n.pendingApproval")}</p>;
}
