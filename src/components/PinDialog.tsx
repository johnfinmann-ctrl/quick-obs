import { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { verifyPin } from "../storage/pin";
import styles from "./PinDialog.module.css";

interface PinDialogProps {
  pinHash: string;
  pinSalt: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinDialog({ pinHash, pinSalt, onSuccess, onCancel }: PinDialogProps) {
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit() {
    setChecking(true);
    const ok = await verifyPin(pin, pinHash, pinSalt);
    setChecking(false);
    if (ok) {
      onSuccess();
    } else {
      setError(t("admin.pin.wrong"));
      setPin("");
    }
  }

  return (
    <div className={styles.overlay} role="alertdialog" aria-modal="true">
      <div className={styles.box}>
        <h2 className={styles.title}>{t("admin.pin.title")}</h2>
        <p className={styles.note}>{t("admin.pin.notMilitaryGrade")}</p>
        <input
          className={styles.pinInput}
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={pin}
          autoFocus
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={onCancel}>
            {t("export.cancel")}
          </button>
          <button type="button" className={styles.primaryButton} onClick={handleSubmit} disabled={checking || pin.length < 4}>
            {t("admin.pin.unlock")}
          </button>
        </div>
      </div>
    </div>
  );
}
