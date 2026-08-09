import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { storeAudioRecording } from "../../storage/media";
import styles from "./MediaCapture.module.css";

interface VoiceRecorderProps {
  onRecorded: (mediaId: string) => void;
}

/**
 * Lokal taleoptagelse via MediaRecorder API. Optager til en Blob, som
 * gemmes lokalt i IndexedDB - INGEN cloud-transskription eller upload.
 * Diktering-til-tekst sker fortsat via enhedens eget tastatur i
 * tekstfelterne, ikke her.
 */
export function VoiceRecorder({ onRecorded }: VoiceRecorderProps) {
  const { t } = useTranslation();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t("fields.voice.notSupported"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        setBusy(true);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const result = await storeAudioRecording(blob, seconds);
        setBusy(false);
        if (result.error) {
          setError(result.error);
        } else if (result.item) {
          onRecorded(result.item.id);
        }
        stream.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError(t("fields.voice.permissionDenied"));
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div>
      {!recording ? (
        <button type="button" className={styles.captureButton} onClick={start} disabled={busy}>
          <Mic aria-hidden="true" size={18} style={{ verticalAlign: "-4px", marginRight: 6 }} />
          {busy ? t("fields.media.processing") : t("fields.voice.start")}
        </button>
      ) : (
        <button type="button" className={styles.captureButton} onClick={stop} style={{ background: "var(--qo-color-mayday)", borderColor: "var(--qo-color-mayday)" }}>
          <Square aria-hidden="true" size={18} style={{ verticalAlign: "-4px", marginRight: 6 }} />
          {t("fields.voice.stop")} ({mm}:{ss})
        </button>
      )}
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
