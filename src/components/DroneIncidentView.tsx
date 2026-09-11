import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { BackButton } from "./BackButton";
import { MapView } from "./MapView";
import { listIncidentReports } from "../utils/droneIncident";
import type { Report } from "../types";
import styles from "./DroneIncidentView.module.css";

/**
 * Haendelsesoversigt: samler alle Drone-Obs-observationer, der er
 * knyttet til samme haendelse, med kort og tidslinje. Rent
 * dokumentationsvaerktoej - beregner IKKE automatisk en fjendtlig
 * hensigt eller sikker identifikation.
 */
export function DroneIncidentView({ incidentId, onBack }: { incidentId: string; onBack: () => void }) {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    listIncidentReports(incidentId).then(setReports);
  }, [incidentId]);

  function parseLatLng(value: unknown): { lat: number; lng: number } | null {
    if (typeof value !== "string") return null;
    const m = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null;
  }

  const markers = reports
    .map((r, i) => {
      const pos = parseLatLng(r.values.gpsPosition);
      if (!pos) return null;
      return {
        id: r.id,
        latitude: pos.lat,
        longitude: pos.lng,
        label: `#${i + 1} ${r.title}`,
        timestamp: typeof r.values.dtg === "string" ? r.values.dtg : r.updatedAt,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return (
    <div className={styles.container}>
      <BackButton onClick={onBack} />
      <h1 className={styles.title}>{t("drone.incident.title")}</h1>
      <p>{t("drone.incident.description")}</p>

      <MapView markers={markers} heightPx={240} />

      {reports.map((r, i) => (
        <div key={r.id} className={styles.item}>
          <p style={{ fontWeight: 700, margin: 0 }}>
            #{i + 1} {i === 0 ? t("drone.incident.first") : i === reports.length - 1 ? t("drone.incident.latest") : ""}
          </p>
          <p style={{ margin: "4px 0 0" }}>{r.title}</p>
          <p style={{ margin: "4px 0 0", opacity: 0.75, fontSize: "0.85rem" }}>
            {typeof r.values.dtg === "string" ? r.values.dtg : "-"} ·{" "}
            {typeof r.values.flightPattern === "string" ? r.values.flightPattern : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
