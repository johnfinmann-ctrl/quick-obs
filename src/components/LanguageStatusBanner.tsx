import { useTranslation } from "../i18n/useTranslation";
import styles from "./DemoBanner.module.css";

/**
 * Permanent, tydelig sprogstatus - vises under demobanneret, naar det
 * aktive sprog ikke er dansk. Kalaallisut skal ALDRIG fremstaa som
 * faerdigt, naar der reelt kun vises dansk fallback-tekst.
 */
export function LanguageStatusBanner() {
  const { language, t } = useTranslation();
  if (language === "da") return null;

  const message = language === "fo" ? t("app.foStatusBanner") : t("app.klStatusBanner");

  return (
    <div className={styles.banner} style={{ background: "var(--qo-color-pan-pan)", color: "#3a1f00" }} role="note">
      {message}
    </div>
  );
}
