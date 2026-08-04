import { useState } from "react";
import { Settings, X, Sun, Moon } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";
import { SUPPORTED_LANGUAGES } from "../i18n/languages";
import { useTheme } from "../theme/useTheme";
import styles from "./SettingsPanel.module.css";

/**
 * Indstillinger tilgaengelige via et almindeligt, synligt tandhjulsikon
 * (ikke skjult gestus). Fase 1 goer sprog og tema faktisk funktionelle;
 * region, kaldesignal, backup og lagringsstatus vises som kommende
 * funktioner, der aktiveres i senere faser.
 */
export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-label={t("nav.settings")}
      >
        <Settings aria-hidden="true" size={24} />
      </button>

      {open && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={t("nav.settings")}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>{t("nav.settings")}</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setOpen(false)}
                aria-label={t("nav.back")}
              >
                <X aria-hidden="true" size={22} />
              </button>
            </div>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Sprog</h3>
              <div className={styles.languageOptions}>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    className={`${styles.chip} ${language === lang.code ? styles.chipActive : ""}`}
                    onClick={() => setLanguage(lang.code)}
                    aria-pressed={language === lang.code}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Tema</h3>
              <button type="button" className={styles.themeToggle} onClick={toggleTheme}>
                {theme === "light" ? (
                  <Moon aria-hidden="true" size={20} />
                ) : (
                  <Sun aria-hidden="true" size={20} />
                )}
                <span>{theme === "light" ? "Skift til moerkt felttema" : "Skift til lyst tema"}</span>
              </button>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Kommer i senere fase</h3>
              <ul className={styles.upcomingList}>
                <li>Region</li>
                <li>Lokalt kaldesignal</li>
                <li>Eksport af lokal backup</li>
                <li>Lagringsstatus</li>
              </ul>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
