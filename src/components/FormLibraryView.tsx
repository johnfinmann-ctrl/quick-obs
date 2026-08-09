import { useTranslation } from "../i18n/useTranslation";
import { useFormLibrary } from "../formLibrary/useFormLibrary";
import { BackButton } from "./BackButton";
import styles from "./FormLibraryView.module.css";

const STATUS_CLASS: Record<string, string> = {
  demo: styles.badgeDemo,
  udkast: styles.badgeUdkast,
  verificeret: styles.badgeVerificeret,
};

/**
 * Blanketbibliotek: konfigurationsstyret oversigt over alle blanketter
 * (Hurtig rapport, Meldingsblanket, SITREP, 9-Liner, MIST, Dronemelding,
 * SAR-melding), deres version, status og seneste faglige kontrol.
 * Aktivering/deaktivering og sortering styres i Administration.
 */
export function FormLibraryView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { definitions } = useFormLibrary();

  return (
    <div className={styles.container}>
      <BackButton onClick={onBack} />
      <h1 className={styles.title}>{t("formLibrary.title")}</h1>
      <p>{t("formLibrary.description")}</p>

      {definitions.map((def) => (
        <div key={def.kind} className={styles.card}>
          <div className={styles.cardTop}>
            <p className={styles.name}>{t(def.titleId)}</p>
            <span className={`${styles.badge} ${STATUS_CLASS[def.status]}`}>
              {t(`formLibrary.status.${def.status}`)}
            </span>
          </div>
          <p className={styles.meta}>
            {t("formLibrary.version")}: {def.version} · {t("formLibrary.lastReview")}: {def.lastReview}
          </p>
          <span className={`${styles.badge} ${def.active ? styles.badgeDemo : styles.badgeInactive}`} style={{ width: "fit-content" }}>
            {def.active ? t("formLibrary.active") : t("formLibrary.inactive")}
          </span>
        </div>
      ))}
    </div>
  );
}
