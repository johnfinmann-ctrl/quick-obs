import { useEffect, useRef, useState } from "react";
import { Mic, Square, Pause, Play } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { storeAudioRecording } from "../../storage/media";
import styles from "./MediaCapture.module.css";

interface VoiceRecorderProps {
  onRecorded: (mediaId: string) => void;
}

/**
 * Lokal taleoptagelse via MediaRecorder API. Starter automatisk, naar
 * komponenten vises (brugeren har allerede trykket "Start
 * taleoptagelse" i det faelles medie-kort). Understoetter pause/
 * fortsaet, hvor browseren tillader det. Optager til en Blob, som gemmes
 * lokalt i IndexedDB - INGEN cloud-transskription eller upload.
 * Diktering-til-tekst sker fortsat via enhedens eget tastatur i
 * tekstfelterne, adskilt fra denne lydfil-optagelse.
 */
export function VoiceRecorder({ onRecorded }: VoiceRecorderProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"starting" | "recording" | "paused" | "saving">("starting");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [canPause, setCanPause] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    start();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
    // eslint-disable-next-line
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
      setCanPause(typeof recorder.pause === "function");
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        setPhase("saving");
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const result = await storeAudioRecording(blob, seconds);
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
      setPhase("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError(t("fields.voice.permissionDenied"));
    }
  }

  function stop() {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function pause() {
    recorderRef.current?.pause();
    setPhase("paused");
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function resume() {
    recorderRef.current?.resume();
    setPhase("recording");
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div>
      {(phase === "recording" || phase === "paused") && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className={styles.captureButton}
            style={{ background: "var(--qo-color-mayday)", borderColor: "var(--qo-color-mayday)" }}
            onClick={stop}
          >
            <Square aria-hidden="true" size={18} />
            {t("fields.voice.stop")} ({mm}:{ss})
          </button>
          {canPause && phase === "recording" && (
            <button type="button" className={styles.secondaryButton} onClick={pause}>
              <Pause aria-hidden="true" size={16} style={{ verticalAlign: "-3px" }} /> {t("fields.voice.pause")}
            </button>
          )}
          {canPause && phase === "paused" && (
            <button type="button" className={styles.secondaryButton} onClick={resume}>
              <Play aria-hidden="true" size={16} style={{ verticalAlign: "-3px" }} /> {t("fields.voice.resume")}
            </button>
          )}
        </div>
      )}
      {phase === "starting" && !error && (
        <p className={styles.statusText}>
          <Mic aria-hidden="true" size={16} style={{ verticalAlign: "-3px" }} /> {t("fields.voice.requestingPermission")}
        </p>
      )}
      {phase === "saving" && <p className={styles.statusText}>{t("fields.media.processing")}</p>}
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
