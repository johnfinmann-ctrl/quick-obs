import { buildTimeMetadata, detectDeviceTimeZone } from "./time";
import { loadSettings } from "../storage/settings";
import type { MediaGpsMetadata } from "../types";

export interface CapturedMediaMetadata {
  capturedAtUtc: string;
  timeZone: string;
  utcOffsetMinutes: number;
  localDateTime: string;
  gps: MediaGpsMetadata | null;
}

/** Bruger admins manuelle tidszone, hvis valgt - ellers enhedens registrerede tidszone. */
async function resolveTimeZone(): Promise<string> {
  const settings = await loadSettings();
  if (settings.timeZoneMode === "manual" && settings.manualTimeZone) {
    return settings.manualTimeZone;
  }
  return detectDeviceTimeZone();
}

/**
 * Registrerer GPS-position og tidsmetadata paa selve optagelsestidspunktet
 * for et nyt foto/video/lydoptagelse. Bruges KUN for medier optaget i
 * appen - importerede filer faar IKKE forsoegt paafundet GPS/tid, kun et
 * tydeligt importtidspunkt (se storeMediaFile).
 */
export async function captureMediaMetadata(): Promise<CapturedMediaMetadata> {
  const now = new Date();
  const timeZone = await resolveTimeZone();
  const time = buildTimeMetadata(now, timeZone, "auto", false);

  let gps: MediaGpsMetadata | null = null;
  if ("geolocation" in navigator) {
    gps = await new Promise<MediaGpsMetadata | null>((resolve) => {
      const timeout = setTimeout(() => resolve(null), 6000);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy ?? null,
          });
        },
        () => {
          clearTimeout(timeout);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 5500 },
      );
    });
  }

  return {
    capturedAtUtc: time.capturedAtUtc,
    timeZone: time.timeZone,
    utcOffsetMinutes: time.utcOffsetMinutes,
    localDateTime: time.localDateTime,
    gps,
  };
}
