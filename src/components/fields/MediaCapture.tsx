import { useEffect, useRef, useState } from "react";
import { Camera, Video, Mic, ImagePlus, Trash2, Pencil, Check, MapPin, Share2 } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { getMedia, storeMediaFile, renameMedia } from "../../storage/media";
import { VoiceRecorder } from "./VoiceRecorder";
import { VideoRecorder } from "./VideoRecorder";
import { formatUtcOffsetLabel } from "../../utils/time";
import type { MediaItem } from "../../types";
import styles from "./MediaCapture.module.css";

interface MediaCaptureProps {
  ids: string[];
  onChange: (ids: string[]) => void;
}

interface LoadedItem {
  item: MediaItem;
  url: string;
}

function defaultName(item: MediaItem, t: (k: string) => string): string {
  if (item.name) return item.name;
  const label = item.kind === "photo" ? t("fields.media.photo") : item.kind === "video" ? t("fields.media.video") : t("fields.media.audio");
  return `${label} - ${new Date(item.createdAt).toLocaleTimeString("da-DK")}`;
}

function extensionFor(mimeType: string): string {
  const sub = mimeType.split("/")[1]?.split(";")[0];
  return sub || "bin";
}

/**
 * Deler en video- eller lydfil som en separat fil via Web Share API,
 * hvis browseren understoetter fil-deling - ellers hentes filen i
 * stedet (tydelig fallback, fx paa iOS-browsere uden filstoette).
 */
async function shareMediaFile(item: MediaItem, label: string, t: (k: string) => string, onStatus: (s: string) => void) {
  const filename = `${label.replace(/[^a-z0-9æøå-]+/gi, "_").toLowerCase()}.${extensionFor(item.mimeType)}`;
  const file = new File([item.blob], filename, { type: item.mimeType });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: label });
      onStatus(t("export.shared"));
      return;
    } catch {
      return; // brugeren annullerede
    }
  }

  const url = URL.createObjectURL(item.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  onStatus(t("export.shareFallback"));
}

/**
 * Den ENE faelles mediekomponent i hele kodebasen ("Dokumentér
 * hændelsen") - genbruges paa tvaers af alle blanketter, aldrig
 * kopieret. Fire store knapper: foto, video med lyd, taleoptagelse,
 * vaelg eksisterende. Alt gemmes lokalt i IndexedDB med fuld
 * tids-/GPS-metadata for optagne filer (se storage/media.ts) - ingen
 * cloud-upload, ingen eksterne analyse-/AI-/transskriptionstjenester.
 */
export function MediaCapture({ ids, onChange }: MediaCaptureProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<LoadedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mediaStatus, setMediaStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [activeRecorder, setActiveRecorder] = useState<"video" | "voice" | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  async function refreshItems() {
    const loaded: LoadedItem[] = [];
    for (const id of ids) {
      const item = await getMedia(id);
      if (item) loaded.push({ item, url: URL.createObjectURL(item.blob) });
    }
    setItems((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return loaded;
    });
  }

  useEffect(() => {
    refreshItems();
    // eslint-disable-next-line
  }, [ids.join(",")]);

  useEffect(() => {
    return () => {
      items.forEach((i) => URL.revokeObjectURL(i.url));
    };
    // eslint-disable-next-line
  }, []);

  async function handlePhotoFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const newIds = [...ids];
    for (const file of Array.from(files)) {
      const result = await storeMediaFile(file, "captured");
      if (result.error) setError(result.error);
      else if (result.item) newIds.push(result.item.id);
    }
    onChange(newIds);
    setBusy(false);
  }

  async function handleLibraryFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const newIds = [...ids];
    for (const file of Array.from(files)) {
      const result = await storeMediaFile(file, "imported");
      if (result.error) setError(result.error);
      else if (result.item) newIds.push(result.item.id);
    }
    onChange(newIds);
    setBusy(false);
  }

  function handleDelete(id: string) {
    onChange(ids.filter((existing) => existing !== id));
  }

  function handleRecorded(mediaId: string) {
    onChange([...ids, mediaId]);
    setActiveRecorder(null);
  }

  function startRename(item: MediaItem) {
    setRenamingId(item.id);
    setRenameValue(defaultName(item, t));
  }

  async function confirmRename(id: string) {
    await renameMedia(id, renameValue.trim() || t("fields.media.untitled"));
    setRenamingId(null);
    refreshItems();
  }

  return (
    <div className={styles.documentCard}>
      <h2 className={styles.documentTitle}>{t("fields.media.documentTitle")}</h2>

      {activeRecorder === "video" && (
        <VideoRecorder onRecorded={handleRecorded} onCancel={() => setActiveRecorder(null)} />
      )}
      {activeRecorder === "voice" && (
        <VoiceRecorder onRecorded={handleRecorded} />
      )}

      {!activeRecorder && (
        <div className={styles.buttonGrid}>
          <button type="button" className={styles.captureButton} onClick={() => photoInputRef.current?.click()}>
            <Camera aria-hidden="true" size={22} />
            {t("fields.media.takePhoto")}
          </button>
          <button type="button" className={styles.captureButton} onClick={() => setActiveRecorder("video")}>
            <Video aria-hidden="true" size={22} />
            {t("fields.media.recordVideoWithAudio")}
          </button>
          <button type="button" className={styles.captureButton} onClick={() => setActiveRecorder("voice")}>
            <Mic aria-hidden="true" size={22} />
            {t("fields.voice.start")}
          </button>
          <button type="button" className={styles.captureButton} onClick={() => libraryInputRef.current?.click()}>
            <ImagePlus aria-hidden="true" size={22} />
            {t("fields.media.chooseExisting")}
          </button>
        </div>
      )}

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={styles.hiddenInput}
        onChange={(e) => handlePhotoFiles(e.target.files)}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        className={styles.hiddenInput}
        onChange={(e) => handleLibraryFiles(e.target.files)}
      />

      {busy && <p className={styles.statusText}>{t("fields.media.processing")}</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      {mediaStatus && <p className={styles.statusText}>{mediaStatus}</p>}

      {items.length > 0 && (
        <div className={styles.list}>
          {items.map(({ item, url }) => (
            <div key={item.id} className={styles.item}>
              {item.kind === "photo" && <img src={url} alt="" className={styles.thumb} />}
              {item.kind === "video" && <video src={url} className={styles.thumb} muted />}
              {item.kind === "audio" && <audio src={url} controls style={{ maxWidth: 200 }} />}

              <div className={styles.itemInfo}>
                {renamingId === item.id ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} style={{ flex: 1, minWidth: 0 }} />
                    <button type="button" onClick={() => confirmRename(item.id)} aria-label={t("fields.media.confirmRename")}>
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <p>
                    {defaultName(item, t)}
                    <span className={styles.originTag}>
                      {item.origin === "captured" ? t("fields.media.originCaptured") : t("fields.media.originImported")}
                    </span>
                    {item.kind === "video" && item.micActive !== null && (
                      <span className={styles.originTag}>
                        {item.micActive ? t("fields.video.micOn") : t("fields.video.micOff")}
                      </span>
                    )}
                  </p>
                )}
                <p className={styles.metaLine}>
                  {(item.sizeBytes / 1024).toFixed(0)} KB
                  {item.compressed ? ` \u00b7 ${t("fields.media.compressed")}` : ""}
                  {item.durationSeconds ? ` \u00b7 ${item.durationSeconds}s` : ""}
                </p>
                {item.capturedAtUtc ? (
                  <p className={styles.metaLine}>
                    {item.localDateTime} ({item.timeZone}, {item.utcOffsetMinutes !== null ? formatUtcOffsetLabel(item.utcOffsetMinutes) : ""})
                  </p>
                ) : (
                  <p className={styles.metaLine}>{t("fields.media.captureTimeUnavailable")}</p>
                )}
                {item.gps ? (
                  <p className={styles.metaLine}>
                    <MapPin size={12} style={{ verticalAlign: "-2px" }} /> {item.gps.latitude.toFixed(5)}, {item.gps.longitude.toFixed(5)}
                    {item.gps.accuracyMeters ? ` (\u00b1${Math.round(item.gps.accuracyMeters)} m)` : ""}
                  </p>
                ) : (
                  <p className={styles.metaLine}>{t("fields.media.gpsUnavailable")}</p>
                )}
              </div>
              {renamingId !== item.id && (item.kind === "video" || item.kind === "audio") && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  style={{ borderColor: "var(--qo-color-heading)", color: "var(--qo-color-heading)" }}
                  onClick={() => shareMediaFile(item, defaultName(item, t), t, setMediaStatus)}
                  aria-label={t("export.shareFile")}
                >
                  <Share2 aria-hidden="true" size={18} />
                </button>
              )}
              {renamingId !== item.id && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  style={{ borderColor: "var(--qo-color-heading)", color: "var(--qo-color-heading)" }}
                  onClick={() => startRename(item)}
                  aria-label={t("fields.media.rename")}
                >
                  <Pencil aria-hidden="true" size={18} />
                </button>
              )}
              <button type="button" className={styles.deleteButton} onClick={() => handleDelete(item.id)} aria-label={t("fields.media.delete")}>
                <Trash2 aria-hidden="true" size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
