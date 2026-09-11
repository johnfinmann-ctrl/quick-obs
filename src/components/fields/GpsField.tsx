import { useState } from "react";
import { FieldWrapper } from "./FieldWrapper";
import { fieldStyles as styles } from "./fieldSharedStyles";
import { useTranslation } from "../../i18n/useTranslation";
import { MapView } from "../MapView";

type PositionSource = "auto" | "manual" | null;

interface GpsFieldProps {
  id: string;
  labelId: string;
  helpId?: string;
  value: string;
  source: PositionSource;
  onChange: (value: string, source: "auto" | "manual") => void;
}

function parseLatLng(value: string): { lat: number; lng: number } | null {
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  return { lat: Number(match[1]), lng: Number(match[2]) };
}

/**
 * GPS-felt: kan udfyldes automatisk via enhedens geolocation-API, men
 * feltet er altid et almindeligt, frit redigerbart tekstfelt bagefter -
 * "automatisk, men altid rettes manuelt". Registrerer, om den gemte
 * position stammer fra automatisk hentning eller manuel indtastning/
 * korrektion (vist i rapportens metadata). Valgfri kortvisning (Leaflet/
 * OSM) tillader ogsaa manuel placering ved tryk paa kortet.
 */
export function GpsField({ id, labelId, helpId, value, source, onChange }: GpsFieldProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [readout, setReadout] = useState<{ accuracy: number; timestamp: string } | null>(null);
  const [showMap, setShowMap] = useState(false);

  const handleFetch = () => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setErrorMsg(t("fields.gps.error"));
      return;
    }
    setStatus("loading");
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        onChange(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, "auto");
        setReadout({ accuracy, timestamp: new Date(pos.timestamp).toISOString() });
        setStatus("idle");
      },
      (err) => {
        setStatus("error");
        setErrorMsg(err.code === err.PERMISSION_DENIED ? t("fields.gps.permissionDenied") : t("fields.gps.error"));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const parsed = parseLatLng(value);

  return (
    <FieldWrapper labelId={labelId} helpId={helpId} htmlFor={id}>
      <div className={styles.row}>
        <input
          id={id}
          className={styles.input}
          style={{ flex: 1, minWidth: 180 }}
          type="text"
          value={value}
          placeholder="fx 65.60000, -37.63000"
          onChange={(e) => onChange(e.target.value, "manual")}
        />
        <button type="button" className={styles.smallButton} onClick={handleFetch}>
          {status === "loading" ? t("fields.gps.loading") : t("fields.gps.fetch")}
        </button>
        <button type="button" className={styles.smallButton} onClick={() => setShowMap((s) => !s)}>
          {showMap ? t("fields.gps.hideMap") : t("fields.gps.showMap")}
        </button>
      </div>
      {status === "error" && errorMsg && (
        <p style={{ color: "var(--qo-color-mayday)", margin: 0, fontSize: "0.875rem" }}>{errorMsg}</p>
      )}
      {readout && (
        <p style={{ opacity: 0.75, margin: 0, fontSize: "0.875rem" }}>
          {t("fields.gps.accuracy")}: {"\u00b1"}
          {Math.round(readout.accuracy)} m {"\u00b7"} {t("fields.gps.timestamp")}:{" "}
          {new Date(readout.timestamp).toLocaleTimeString("da-DK")}
        </p>
      )}
      {source === "manual" && value && (
        <p style={{ fontSize: "0.75rem", opacity: 0.7, margin: 0 }}>{t("fields.gps.manuallyEdited")}</p>
      )}
      {showMap && (
        <MapView
          markers={parsed ? [{ id: "current", latitude: parsed.lat, longitude: parsed.lng, label: t(labelId) }] : []}
          onPick={(lat, lng) => onChange(`${lat.toFixed(5)}, ${lng.toFixed(5)}`, "manual")}
          showCurrentLocation
          heightPx={220}
        />
      )}
    </FieldWrapper>
  );
}
