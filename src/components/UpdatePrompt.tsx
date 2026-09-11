import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useTranslation } from "../i18n/useTranslation";
import styles from "./UpdatePrompt.module.css";

/**
 * Kontrolleret PWA-opdatering. Naar en ny version af app-shell'en er
 * cachet i baggrunden (service worker i "waiting"-tilstand), vises en
 * tydelig prompt i stedet for at genindlaese appen automatisk og
 * uventet - vigtigt naar brugeren kan vaere midt i at udfylde en
 * rapport i felten. Et tryk paa "Opdater" sender SKIP_WAITING til
 * service workeren; naar den nye version overtager kontrollen
 * (`controllerchange`), genindlaeser siden sig selv én gang.
 */
export function UpdatePrompt() {
  const { t } = useTranslation();
  const [offlineReadyShown, setOfflineReadyShown] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Tjek jaevnligt for en ny version, saa langtidsaabne faner i felten
      // ogsaa opdager en opdatering.
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
  });

  useEffect(() => {
    if (offlineReady) {
      setOfflineReadyShown(true);
      const timer = setTimeout(() => setOfflineReady(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady, setOfflineReady]);

  function close() {
    setNeedRefresh(false);
    setOfflineReady(false);
  }

  if (needRefresh) {
    return (
      <div className={styles.banner} role="status">
        <span className={styles.text}>{t("pwa.updateAvailable")}</span>
        <button type="button" className={styles.button} onClick={() => updateServiceWorker(true)}>
          {t("pwa.updateNow")}
        </button>
        <button type="button" className={`${styles.button} ${styles.dismiss}`} onClick={close}>
          {t("pwa.updateLater")}
        </button>
      </div>
    );
  }

  if (offlineReady && offlineReadyShown) {
    return (
      <div className={styles.banner} role="status">
        <span className={styles.text}>{t("pwa.offlineReady")}</span>
        <button type="button" className={`${styles.button} ${styles.dismiss}`} onClick={close}>
          {t("pwa.dismiss")}
        </button>
      </div>
    );
  }

  return null;
}
