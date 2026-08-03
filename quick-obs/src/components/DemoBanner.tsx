import { useTranslation } from "../i18n";
import styles from "./DemoBanner.module.css";

/**
 * Permanent, tydelig demomaerkning. Vises paa alle skaerme og kan ikke lukkes.
 */
export function DemoBanner() {
  const { t } = useTranslation();
  return (
    <div className={styles.banner} role="note">
      {t("app.demoBanner")}
    </div>
  );
}
