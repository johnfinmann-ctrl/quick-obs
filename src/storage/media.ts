import { dbDelete, dbGet, dbPut, STORES } from "./db";
import type { MediaItem, MediaGpsMetadata } from "../types";
import { captureMediaMetadata } from "../utils/mediaCaptureMetadata";

const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.75;
/** Videoer over denne graense afvises med en tydelig fejlbesked. */
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024; // 60 MB
/** Lydoptagelser over denne graense afvises med en tydelig fejlbesked. */
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB

export async function getMedia(id: string): Promise<MediaItem | undefined> {
  return dbGet<MediaItem>(STORES.media, id);
}

export async function deleteMedia(id: string): Promise<void> {
  await dbDelete(STORES.media, id);
}

export async function renameMedia(id: string, name: string): Promise<void> {
  const item = await getMedia(id);
  if (!item) return;
  await dbPut(STORES.media, { ...item, name });
}

function newMediaId(): string {
  return `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Komprimerer et billede lokalt via canvas (ingen cloud/AI-tjeneste involveret). */
async function compressImage(file: File | Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file instanceof Blob ? file : file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? (file as Blob)), "image/jpeg", IMAGE_QUALITY);
  });
}

export interface StoreMediaResult {
  item?: MediaItem;
  error?: string;
}

/**
 * Gemmer en foto- eller videofil lokalt i IndexedDB. Ingen upload nogen
 * steder.
 *
 * `origin`:
 * - "captured": filen kommer fra "Tag foto"/"Optag video"-knapperne
 *   (enhedens kamera-app via <input capture>) - her registreres GPS og
 *   tidsmetadata paa selve optagelsestidspunktet.
 * - "imported": filen er valgt fra "Vaelg eksisterende" - her paafindes
 *   INGEN GPS/optagelsestid. Kun importtidspunktet registreres som
 *   `createdAt`, og de oprindelige capture-felter forbliver `null`
 *   ("ikke tilgaengeligt"), jf. kravet om ikke at opdigte metadata.
 */
export async function storeMediaFile(
  file: File,
  origin: "captured" | "imported" = "imported",
): Promise<StoreMediaResult> {
  const isVideo = file.type.startsWith("video/");
  const isPhoto = file.type.startsWith("image/");
  const isAudio = file.type.startsWith("audio/");

  if (!isVideo && !isPhoto && !isAudio) {
    return { error: "Filtypen genkendes ikke som foto, video eller lyd." };
  }

  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return {
      error: `Videoen er for stor (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimum er ${MAX_VIDEO_BYTES / 1024 / 1024} MB i denne demo.`,
    };
  }
  if (isAudio && file.size > MAX_AUDIO_BYTES) {
    return {
      error: `Lydfilen er for stor (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimum er ${MAX_AUDIO_BYTES / 1024 / 1024} MB i denne demo.`,
    };
  }

  let blob: Blob = file;
  let compressed = false;
  if (isPhoto) {
    try {
      blob = await compressImage(file);
      compressed = true;
    } catch {
      blob = file;
    }
  }

  let meta: { capturedAtUtc: string | null; timeZone: string | null; utcOffsetMinutes: number | null; localDateTime: string | null; gps: MediaGpsMetadata | null } = {
    capturedAtUtc: null,
    timeZone: null,
    utcOffsetMinutes: null,
    localDateTime: null,
    gps: null,
  };
  if (origin === "captured") {
    const captured = await captureMediaMetadata();
    meta = captured;
  }

  const item: MediaItem = {
    id: newMediaId(),
    blob,
    mimeType: file.type,
    kind: isVideo ? "video" : isAudio ? "audio" : "photo",
    sizeBytes: blob.size,
    createdAt: new Date().toISOString(),
    compressed,
    origin,
    ...meta,
    micActive: null,
  };

  await dbPut(STORES.media, item);
  return { item };
}

/**
 * Gemmer en lokalt optaget taleoptagelse (fra MediaRecorder). Ingen
 * cloud-transskription - lydfilen gemmes blot som binaer data lokalt.
 * GPS/tid registreres paa optagelsestidspunktet, ligesom for foto/video.
 */
export async function storeAudioRecording(blob: Blob, durationSeconds: number): Promise<StoreMediaResult> {
  if (blob.size > MAX_AUDIO_BYTES) {
    return {
      error: `Lydoptagelsen er for stor (${(blob.size / 1024 / 1024).toFixed(1)} MB). Maksimum er ${MAX_AUDIO_BYTES / 1024 / 1024} MB i denne demo.`,
    };
  }

  const meta = await captureMediaMetadata();

  const item: MediaItem = {
    id: newMediaId(),
    blob,
    mimeType: blob.type || "audio/webm",
    kind: "audio",
    sizeBytes: blob.size,
    createdAt: new Date().toISOString(),
    durationSeconds,
    origin: "captured",
    ...meta,
    micActive: null,
  };

  await dbPut(STORES.media, item);
  return { item };
}

/**
 * Gemmer en lokalt optaget video (fra MediaRecorder, med eller uden lyd).
 * `micActive` registrerer, om mikrofonen reelt var tilsluttet under
 * optagelsen - bruges til at vise "Video optages uden lyd..."-beskeden
 * korrekt og til at markere det i mediets metadata.
 */
export async function storeVideoRecording(
  blob: Blob,
  durationSeconds: number,
  micActive: boolean,
): Promise<StoreMediaResult> {
  if (blob.size > MAX_VIDEO_BYTES) {
    return {
      error: `Videoen er for stor (${(blob.size / 1024 / 1024).toFixed(1)} MB). Maksimum er ${MAX_VIDEO_BYTES / 1024 / 1024} MB i denne demo.`,
    };
  }

  const meta = await captureMediaMetadata();

  const item: MediaItem = {
    id: newMediaId(),
    blob,
    mimeType: blob.type || "video/webm",
    kind: "video",
    sizeBytes: blob.size,
    createdAt: new Date().toISOString(),
    durationSeconds,
    origin: "captured",
    ...meta,
    micActive,
  };

  await dbPut(STORES.media, item);
  return { item };
}
