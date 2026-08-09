import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { BackButton } from "./BackButton";
import { MapView } from "./MapView";
import { localTestDataProvider } from "../droneSurveillance/localTestDataProvider";
import type { DroneSensorObservation } from "../types";
import styles from "./DroneSurveillanceView.module.css";

/**
 * Separat teknisk demo-interface for FREMTIDIG droneovervaagning.
 *
 * Der er IKKE tilsluttet nogen sensor eller datakilde. Det telefonens
 * eget kamera eller GPS maa ALDRIG fremstilles som automatisk
 * droneovervaagning - denne side viser udelukkende tydeligt markerede
 * lokale testdata og en providerarkitektur til fremtidig, lovlig
 * integration. Ingen trusselsvurdering, maalidentifikation eller
 * bekaempelses-/reaktionsanvisninger forekommer nogen steder her.
 */
export function DroneSurveillanceView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [observations, setObservations] = useState<DroneSensorObservation[]>([]);

  useEffect(() => {
    localTestDataProvider.fetchObservations().then(setObservations);
  }, []);

  const markers = observations.map((o) => ({
    id: o.id,
    latitude: o.telemetry.latitude,
    longitude: o.telemetry.longitude,
    label: `${new Date(o.observedAt).toLocaleTimeString("da-DK")}`,
    timestamp: o.observedAt,
  }));

  return (
    <div className={styles.container}>
      <BackButton onClick={onBack} />
      <h1 className={styles.title}>{t("drone.title")}</h1>
      <p className={styles.statusBanner}>{t("drone.noActiveSource")}</p>
      <p>{t("drone.description")}</p>

      <MapView markers={markers} heightPx={240} />

      <p className={styles.testDataBanner}>{t("drone.testDataLabel")}</p>
      <div className={styles.timeline}>
        {observations.map((o) => (
          <div key={o.id} className={styles.timelineItem}>
            <p style={{ fontWeight: 700, margin: 0 }}>{new Date(o.observedAt).toLocaleString("da-DK")}</p>
            <p style={{ margin: "4px 0 0" }}>
              {o.telemetry.latitude.toFixed(4)}, {o.telemetry.longitude.toFixed(4)} ·{" "}
              {o.telemetry.altitudeMeters} m · {o.telemetry.headingDegrees}
              {"\u00b0"} ·{" "}
              {o.telemetry.speedMetersPerSecond} m/s
            </p>
            {o.remoteId && (
              <p style={{ margin: "4px 0 0", opacity: 0.75, fontSize: "0.85rem" }}>
                Remote ID: {o.remoteId.serialOrSessionId} ({o.remoteId.broadcastFormatNote})
              </p>
            )}
            <p style={{ margin: "4px 0 0", opacity: 0.6, fontSize: "0.8rem" }}>{o.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
