import { useEffect, useRef, useState } from "react";
import type * as L from "leaflet";
import { useTranslation } from "../i18n/useTranslation";
import { useAppSettings } from "../hooks/useAppSettings";
import styles from "./MapView.module.css";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  timestamp?: string;
  accuracyMeters?: number;
}

interface MapViewProps {
  markers: MapMarker[];
  /** Naar sat, kan brugeren trykke paa kortet for at placere/rette en position manuelt. */
  onPick?: (lat: number, lng: number) => void;
  /** Vis en markoer for enhedens aktuelle position (via geolocation), hvis tilladt. */
  showCurrentLocation?: boolean;
  heightPx?: number;
}

/**
 * Delt kortkomponent (Leaflet + OpenStreetMap-fliser).
 *
 * VIGTIGT om eksterne kortfliser: selve kortbaggrunden (fliserne) hentes
 * fra OpenStreetMaps offentlige flisetjeneste, som er en ekstern tjeneste.
 * Der sendes ALDRIG rapporttekst, persondata eller mediefiler dertil -
 * kun de kvadrattal (zoom/x/y), der noedvendige for at hente
 * baggrundsbilledet. Kortet kan slaas fra i Administration, og GPS/manuel
 * koordinatindtastning fungerer fuldstaendigt uden kortet.
 */
export function MapView({ markers, onPick, showCurrentLocation, heightPx = 260 }: MapViewProps) {
  const { t } = useTranslation();
  const settings = useAppSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [tileError, setTileError] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    if (!showCurrentLocation) return;
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGpsError(err.code === err.PERMISSION_DENIED ? t("map.gpsPermissionDenied") : t("map.gpsError")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [showCurrentLocation, t]);

  const mapEnabled = settings?.mapEnabled ?? true;

  useEffect(() => {
    if (!mapEnabled || !online || !containerRef.current || mapRef.current) return;

    let disposed = false;
    import("leaflet").then((L) => {
      if (disposed || !containerRef.current) return;

      const center: [number, number] =
        markers.length > 0 ? [markers[0].latitude, markers[0].longitude] : [64.0, -25.0];

      const map = L.map(containerRef.current, { attributionControl: true }).setView(center, markers.length > 0 ? 11 : 3);
      const tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap-bidragydere",
      });
      tileLayer.on("tileerror", () => setTileError(true));
      tileLayer.addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;

      if (onPick) {
        map.on("click", (e: L.LeafletMouseEvent) => onPick(e.latlng.lat, e.latlng.lng));
      }

      mapRef.current = map;
    });

    return () => {
      disposed = true;
    };
    // eslint-disable-next-line
  }, [mapEnabled, online]);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    import("leaflet").then((L) => {
      const layerGroup = markersLayerRef.current;
      if (!layerGroup) return;
      layerGroup.clearLayers();
      markers.forEach((m) => {
        L.circleMarker([m.latitude, m.longitude], { radius: 9, color: "#d32f2f", fillColor: "#d32f2f", fillOpacity: 0.85 })
          .bindPopup(`${m.label}${m.timestamp ? `<br>${new Date(m.timestamp).toLocaleString("da-DK")}` : ""}`)
          .addTo(layerGroup);
      });
      if (currentPos) {
        L.circleMarker([currentPos.lat, currentPos.lng], { radius: 8, color: "#0b57d0" })
          .bindPopup(t("map.currentPosition"))
          .addTo(layerGroup);
      }
    });
  }, [markers, currentPos, t]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <p className={styles.disclosure}>{t("map.disclosure")}</p>
      <div className={styles.statusRow}>
        <span className={`${styles.statusBadge} ${online ? styles.online : styles.offline}`}>
          {online ? t("map.online") : t("map.offline")}
        </span>
        {gpsError && <span>{gpsError}</span>}
      </div>

      {!mapEnabled ? (
        <p className={styles.disabledNotice}>{t("map.disabledByAdmin")}</p>
      ) : !online ? (
        <p className={styles.offlineNotice}>{t("map.offlineNotice")}</p>
      ) : (
        <>
          <div ref={containerRef} className={styles.mapContainer} style={{ height: heightPx }} />
          {tileError && <p className={styles.offlineNotice}>{t("map.tileError")}</p>}
        </>
      )}

      {markers.length > 0 && (
        <ul className={styles.coordList}>
          {markers.map((m) => (
            <li key={m.id} className={styles.actionsRow}>
              <span>
                {m.label}: {m.latitude.toFixed(5)}, {m.longitude.toFixed(5)}
                {m.accuracyMeters ? ` (\u00b1${Math.round(m.accuracyMeters)} m)` : ""}
              </span>
              <button
                type="button"
                className={styles.button}
                onClick={() => navigator.clipboard.writeText(`${m.latitude}, ${m.longitude}`)}
              >
                {t("map.copyCoordinate")}
              </button>
              <a
                className={styles.button}
                href={`geo:${m.latitude},${m.longitude}?q=${m.latitude},${m.longitude}(${encodeURIComponent(m.label)})`}
              >
                {t("map.openInDeviceMap")}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
