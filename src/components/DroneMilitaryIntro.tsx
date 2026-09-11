import { useTranslation } from "../i18n/useTranslation";
import styles from "./DroneMilitaryIntro.module.css";

/**
 * Kort, sammenklappelig faglig introduktion i Drone-Obs. Praktisk
 * vejledning - IKKE en officiel myndighedsinstruks, jf. Fase 2.2 punkt 4.
 */
export function DroneMilitaryIntro() {
  const { t } = useTranslation();
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>{t("drone.militaryIntro.title")}</summary>
      <p className={styles.text}>{t("drone.militaryIntro.body")}</p>
      <p className={styles.note}>{t("drone.militaryIntro.disclaimer")}</p>
    </details>
  );
}
