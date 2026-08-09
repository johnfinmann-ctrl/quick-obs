import { useEffect, useRef, useState } from "react";
import { Camera, Video, ImagePlus, Trash2, Pencil, Check } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { FieldWrapper } from "./FieldWrapper";
import { getMedia, storeMediaFile, renameMedia } from "../../storage/media";
import { VoiceRecorder } from "./VoiceRecorder";
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

/**
 * Faelles medie-komponent for alle blanketter: tag/vaelg foto, optag/
 * vaelg video, optag tale, lokal komprimering (billeder), forhaands-
 * visning/afspilning, omdoebning, sletning. Alt gemmes lokalt i
 * IndexedDB - ingen cloud-upload, ingen eksterne analyse-, AI- eller
 * transskriptionstjenester involveret noget sted.
 */
export function MediaCapture({ ids, onChange }: MediaCaptureProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<LoadedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
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

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const newIds = [...ids];
    for (const file of Array.from(files)) {
      const result = await storeMediaFile(file);
      if (result.error) {
        setError(result.error);
        continue;
      }
      if (result.item) newIds.push(result.item.id);
    }
    onChange(newIds);
    setBusy(false);
  }

  function handleDelete(id: string) {
    onChange(ids.filter((existing) => existing !== id));
  }

  function handleVoiceRecorded(mediaId: string) {
    onChange([...ids, mediaId]);
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
    <FieldWrapper labelId="fields.common.media">
      <div className={styles.container}>
        <div className={styles.buttonRow}>
          <button type="button" className={styles.captureButton} onClick={() => photoInputRef.current?.click()}>
            <Camera aria-hidden="true" size={18} style={{ verticalAlign: "-4px", marginRight: 6 }} />
            {t("fields.media.takePhoto")}
          </button>
          <button type="button" className={styles.captureButton} onClick={() => videoInputRef.current?.click()}>
            <Video aria-hidden="true" size={18} style={{ verticalAlign: "-4px", marginRight: 6 }} />
            {t("fields.media.recordVideo")}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={() => libraryInputRef.current?.click()}>
            <ImagePlus aria-hidden="true" size={18} style={{ verticalAlign: "-4px", marginRight: 6 }} />
            {t("fields.media.chooseExisting")}
          </button>
        </div>

        <VoiceRecorder onRecorded={handleVoiceRecorded} />

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={libraryInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {busy && <p className={styles.statusText}>{t("fields.media.processing")}</p>}
        {error && <p className={styles.errorText}>{error}</p>}

        {items.length > 0 && (
          <div className={styles.list}>
            {items.map(({ item, url }) => (
              <div key={item.id} className={styles.item} style={{ flexWrap: "wrap" }}>
                {item.kind === "photo" && <img src={url} alt="" className={styles.thumb} />}
                {item.kind === "video" && <video src={url} className={styles.thumb} muted />}
                {item.kind === "audio" && <audio src={url} controls style={{ maxWidth: 180 }} />}

                <div className={styles.itemInfo}>
                  {renamingId === item.id ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      <button type="button" onClick={() => confirmRename(item.id)} aria-label={t("fields.media.confirmRename")}>
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <p>{defaultName(item, t)}</p>
                  )}
                  <p>
                    {(item.sizeBytes / 1024).toFixed(0)} KB
                    {item.compressed ? ` \u00b7 ${t("fields.media.compressed")}` : ""}
                    {item.durationSeconds ? ` \u00b7 ${item.durationSeconds}s` : ""}
                  </p>
                </div>
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
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleDelete(item.id)}
                  aria-label={t("fields.media.delete")}
                >
                  <Trash2 aria-hidden="true" size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
