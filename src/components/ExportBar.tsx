import { useState } from "react";
import { Copy, Share2, Download, FileText } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";
import { generatePdf, type PdfImage } from "../utils/pdfExport";
import { getMedia } from "../storage/media";
import styles from "./ExportBar.module.css";

interface ExportBarProps {
  title: string;
  buildText: () => string | Promise<string>;
  sensitive: boolean;
  /** Foto-medie-id'er, der kan medtages i PDF'en (video/lyd kan ikke indlejres i PDF). */
  photoMediaIds?: string[];
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Delt eksport-/delingslinje: kopiér ren tekst, Web Share, download tekst,
 * lokal PDF (kan medtage valgte fotos). Ingen automatisk mailafsendelse,
 * ingen eksterne kald. Viser en kort bekraeftelse foer deling af
 * personfoelsomme oplysninger. PDF-eksport paastaas kun at indeholde
 * billeder, naar `photoMediaIds` faktisk er givet - ellers er det rent
 * tekst, hvilket ogsaa fremgaar af rapportteksten selv.
 */
export function ExportBar({ title, buildText, sensitive, photoMediaIds = [] }: ExportBarProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<null | "share" | "download" | "pdf">(null);

  function requireConfirmIfSensitive(action: "share" | "download" | "pdf") {
    if (sensitive) {
      setPendingAction(action);
    } else {
      runAction(action);
    }
  }

  async function runAction(action: "share" | "download" | "pdf") {
    setPendingAction(null);
    const text = await buildText();
    const filenameSafe = title.replace(/[^a-z0-9æøå-]+/gi, "_").toLowerCase();

    if (action === "download") {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      downloadBlob(blob, `${filenameSafe}.txt`);
      setStatus(t("export.downloaded"));
      return;
    }

    if (action === "pdf") {
      const images: PdfImage[] = [];
      for (const id of photoMediaIds) {
        const item = await getMedia(id);
        if (!item || item.kind !== "photo") continue;
        try {
          const dataUrl = await blobToDataUrl(item.blob);
          images.push({ dataUrl, label: item.name ?? id });
        } catch {
          // Enkelt billede kunne ikke laeses - springes over, resten af PDF'en fortsaetter.
        }
      }
      const blob = await generatePdf(title, text, images);
      downloadBlob(blob, `${filenameSafe}.pdf`);
      setStatus(images.length > 0 ? t("export.pdfCreatedWithImages") : t("export.pdfCreated"));
      return;
    }

    if (action === "share") {
      if (navigator.share) {
        try {
          await navigator.share({ title, text });
          setStatus(t("export.shared"));
        } catch {
          // Brugeren annullerede - ikke en fejl
        }
      } else {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        downloadBlob(blob, `${filenameSafe}.txt`);
        setStatus(t("export.shareFallback"));
      }
    }
  }

  async function handleCopy() {
    const text = await buildText();
    try {
      await navigator.clipboard.writeText(text);
      setStatus(t("export.copied"));
    } catch {
      setStatus(t("export.copyFailed"));
    }
  }

  return (
    <div>
      <div className={styles.bar}>
        <button type="button" className={styles.button} onClick={handleCopy}>
          <Copy aria-hidden="true" size={18} /> {t("export.copy")}
        </button>
        <button type="button" className={styles.button} onClick={() => requireConfirmIfSensitive("share")}>
          <Share2 aria-hidden="true" size={18} /> {t("export.share")}
        </button>
        <button type="button" className={styles.button} onClick={() => requireConfirmIfSensitive("download")}>
          <Download aria-hidden="true" size={18} /> {t("export.downloadText")}
        </button>
        <button type="button" className={styles.button} onClick={() => requireConfirmIfSensitive("pdf")}>
          <FileText aria-hidden="true" size={18} /> {photoMediaIds.length > 0 ? t("export.pdfWithImages") : t("export.pdf")}
        </button>
      </div>
      {status && <p className={styles.status}>{status}</p>}
      <p className={styles.status}>{t("export.limitationsNote")}</p>

      {pendingAction && (
        <div className={styles.confirmOverlay} role="alertdialog" aria-modal="true">
          <div className={styles.confirmBox}>
            <p>{t("export.sensitiveWarning")}</p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.button} onClick={() => setPendingAction(null)}>
                {t("export.cancel")}
              </button>
              <button type="button" className={styles.button} onClick={() => runAction(pendingAction)}>
                {t("export.confirmContinue")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
