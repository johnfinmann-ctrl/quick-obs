import { useState } from "react";
import { Copy, Share2, Download, FileText } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";
import { generatePdf } from "../utils/pdfExport";
import styles from "./ExportBar.module.css";

interface ExportBarProps {
  title: string;
  buildText: () => string | Promise<string>;
  sensitive: boolean;
}

/**
 * Delt eksport-/delingslinje: kopiér ren tekst, Web Share, download tekst,
 * lokal PDF. Ingen automatisk mailafsendelse, ingen eksterne kald. Viser
 * en kort bekraeftelse foer deling af personfoelsomme oplysninger.
 */
export function ExportBar({ title, buildText, sensitive }: ExportBarProps) {
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
      const blob = await generatePdf(title, text);
      downloadBlob(blob, `${filenameSafe}.pdf`);
      setStatus(t("export.pdfCreated"));
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
          <FileText aria-hidden="true" size={18} /> {t("export.pdf")}
        </button>
      </div>
      {status && <p className={styles.status}>{status}</p>}

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
