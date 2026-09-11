import { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import type { Report } from "../types";
import { detectDeviceTimeZone, formatDtgZulu, localDateTimeStringToUtcDate } from "../utils/time";
import styles from "./RadioDisplayView.module.css";

interface RadioDisplayViewProps {
  report: Report;
  onClose: () => void;
}

/**
 * "Vis til oplaesning": stor, letlaeselig visning af de vigtigste
 * oplysninger til hoejtlaesning over radio. Rent visningslag - aendrer
 * ALDRIG de registrerede data. Fungerer fuldt offline (kun lokale data,
 * ingen netvaerkskald). NATO-prowords indsaettes ikke automatisk.
 */
export function RadioDisplayView({ report, onClose }: RadioDisplayViewProps) {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<"light" | "dark" | "highContrast">("light");
  const v = report.values;

  const dtgRaw = typeof v.dtg === "string" ? v.dtg : "";
  const utcDate = dtgRaw ? localDateTimeStringToUtcDate(dtgRaw, detectDeviceTimeZone()) : null;
  const position = (typeof v.gpsPosition === "string" && v.gpsPosition) || (typeof v.mgrs === "string" && v.mgrs) || t("map.gpsUnavailable") || "-";

  const facts: { label: string; value: string }[] = [];
  if (typeof v.droneCount === "string" && v.droneCount) facts.push({ label: t("fields.dronemelding.droneCount"), value: v.droneCount });
  if (typeof v.flightPattern === "string" && v.flightPattern) {
    facts.push({ label: t("fields.dronemelding.flightPattern"), value: t(`fields.dronemelding.flightPatternChoice.${v.flightPattern}`) });
  }
  if (typeof v.lastSeenDirection === "string" && v.lastSeenDirection) facts.push({ label: t("fields.dronemelding.lastSeenDirection"), value: v.lastSeenDirection });
  if (typeof v.remarks === "string" && v.remarks) facts.push({ label: t("fields.common.remarks"), value: v.remarks });

  return (
    <div className={`${styles.overlay} ${theme === "dark" ? styles.dark : ""} ${theme === "highContrast" ? styles.highContrast : ""}`}>
      <button type="button" className={styles.closeButton} onClick={onClose}>
        {t("nav.back")}
      </button>
      <div className={styles.themeRow}>
        <button type="button" className={styles.themeButton} onClick={() => setTheme("light")}>{t("radio.themeLight")}</button>
        <button type="button" className={styles.themeButton} onClick={() => setTheme("dark")}>{t("radio.themeDark")}</button>
        <button type="button" className={styles.themeButton} onClick={() => setTheme("highContrast")}>{t("radio.themeHighContrast")}</button>
      </div>

      <div className={styles.block}>
        <span className={styles.label}>DTG</span>
        <p className={styles.dtgLine}>{utcDate ? formatDtgZulu(utcDate) : t("fields.media.captureTimeUnavailable")}</p>
      </div>
      <div className={styles.block}>
        <span className={styles.label}>{t("fields.common.gpsPosition")}</span>
        <p className={styles.dtgLine}>{position}</p>
      </div>
      {facts.map((f, i) => (
        <div key={i} className={styles.line}>
          <span className={styles.label}>{f.label}</span>
          {f.value}
        </div>
      ))}
    </div>
  );
}
