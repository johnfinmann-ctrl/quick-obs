import { useEffect, useRef, useState } from "react";
import { Video, Square, RotateCcw, Check, Mic, MicOff } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { storeVideoRecording } from "../../storage/media";
import mediaStyles from "./MediaCapture.module.css";
import styles from "./VideoRecorder.module.css";

interface VideoRecorderProps {
  onRecorded: (mediaId: string) => void;
  onCancel: () => void;
}

/**
 * Optager video MED lyd som udgangspunkt (kamera + mikrofon). Hvis
 * mikrofonen afvises, mens kameraet tillades, fortsaetter optagelsen
 * uden lyd, og appen viser tydeligt "Video optages uden lyd...". Efter
 * stop kan brugeren afspille, optage igen eller gemme.
 */
export function VideoRecorder({ onRecorded, onCancel }: VideoRecorderProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"idle" | "recording" | "review">("idle");
  const [micActive, setMicActive] = useState<boolean | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    startPreview();
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (reviewUrl) URL.revokeObjectURL(reviewUrl);
    };
    // eslint-disable-next-line
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }

  async function startPreview() {
    setError(null);
    try {
      let stream: MediaStream;
      let mic = true;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        // Mikrofon (eller begge) blev afvist - proev kun video
        mic = false;
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      const hasAudioTrack = stream.getAudioTracks().length > 0;
      mic = mic && hasAudioTrack;
      setMicActive(mic);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play().catch(() => {});
      }
    } catch {
      setError(t("fields.video.cameraPermissionDenied"));
    }
  }

  function startRecording() {
    if (!streamRef.current) return;
    const recorder = new MediaRecorder(streamRef.current);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
      recordedBlobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setReviewUrl(url);
      setPhase("review");
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
    recorder.start();
    recorderRef.current = recorder;
    setSeconds(0);
    setPhase("recording");
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  async function retake() {
    if (reviewUrl) URL.revokeObjectURL(reviewUrl);
    setReviewUrl(null);
    recordedBlobRef.current = null;
    setPhase("idle");
    await startPreview();
  }

  async function save() {
    if (!recordedBlobRef.current) return;
    setBusy(true);
    const result = await storeVideoRecording(recordedBlobRef.current, seconds, micActive ?? false);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.item) onRecorded(result.item.id);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div>
      {phase !== "review" && (
        <>
          <video ref={videoRef} className={styles.preview} playsInline autoPlay muted />
          {micActive !== null && (
            <p>
              <span className={`${styles.micStatus} ${micActive ? styles.micOn : styles.micOff}`}>
                {micActive ? <Mic size={14} /> : <MicOff size={14} />}
                {micActive ? t("fields.video.micOn") : t("fields.video.micOff")}
              </span>
            </p>
          )}
          {micActive === false && <p className={mediaStyles.errorText}>{t("fields.video.noMicWarning")}</p>}
        </>
      )}

      {phase === "review" && reviewUrl && (
        <video src={reviewUrl} className={styles.preview} controls playsInline />
      )}

      {error && <p className={mediaStyles.errorText}>{error}</p>}

      <div className={styles.buttonRow}>
        {phase === "idle" && (
          <>
            <button type="button" className={mediaStyles.captureButton} onClick={startRecording} disabled={!streamRef.current}>
              <Video aria-hidden="true" size={18} /> {t("fields.video.startRecording")}
            </button>
            <button type="button" className={mediaStyles.secondaryButton} onClick={onCancel}>
              {t("export.cancel")}
            </button>
          </>
        )}
        {phase === "recording" && (
          <button
            type="button"
            className={mediaStyles.captureButton}
            style={{ background: "var(--qo-color-mayday)", borderColor: "var(--qo-color-mayday)" }}
            onClick={stopRecording}
          >
            <Square aria-hidden="true" size={18} /> {t("fields.video.stopRecording")} ({mm}:{ss})
          </button>
        )}
        {phase === "review" && (
          <>
            <button type="button" className={mediaStyles.secondaryButton} onClick={retake}>
              <RotateCcw aria-hidden="true" size={18} /> {t("fields.video.retake")}
            </button>
            <button type="button" className={mediaStyles.captureButton} onClick={save} disabled={busy}>
              <Check aria-hidden="true" size={18} /> {busy ? t("fields.media.processing") : t("fields.video.saveRecording")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
