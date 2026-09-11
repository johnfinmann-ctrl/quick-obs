import { useMemo, useState } from "react";
import { FieldWrapper } from "./FieldWrapper";
import { fieldStyles as styles } from "./fieldSharedStyles";
import { useTranslation } from "../../i18n/useTranslation";
import { latLonToMgrs } from "../../utils/mgrs";

interface MgrsFieldProps {
  id: string;
  labelId: string;
  helpId?: string;
  /** Vaerdien af det tilknyttede GPS-felt ("lat, lon"), hvis udfyldt. */
  gpsValue: string;
  value: string;
  source: "auto" | "manual" | null;
  onChange: (value: string, source: "auto" | "manual") => void;
}

function parseLatLng(value: string): { lat: number; lng: number } | null {
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  return { lat: Number(match[1]), lng: Number(match[2]) };
}

/**
 * MGRS som et supplerende koordinatformat. Genereres UDELUKKENDE lokalt
 * (src/utils/mgrs.ts - intet eksternt API) ud fra det tilknyttede
 * GPS-felt, men forbliver et almindeligt, frit redigerbart tekstfelt,
 * saa brugeren altid kan rette eller indtaste MGRS manuelt. Bredde-/
 * laengdegrad bevares uaendret i GPS-feltet ved siden af.
 */
export function MgrsField({ id, labelId, helpId, gpsValue, value, source, onChange }: MgrsFieldProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const computed = useMemo(() => {
    const parsed = parseLatLng(gpsValue);
    if (!parsed) return null;
    try {
      return latLonToMgrs(parsed.lat, parsed.lng).mgrs;
    } catch {
      return null;
    }
  }, [gpsValue]);

  function generate() {
    if (!computed) {
      setError(t("fields.mgrs.noGps"));
      return;
    }
    setError(null);
    onChange(computed, "auto");
  }

  return (
    <FieldWrapper labelId={labelId} helpId={helpId} htmlFor={id}>
      <div className={styles.row}>
        <input
          id={id}
          className={styles.input}
          style={{ flex: 1, minWidth: 180 }}
          type="text"
          value={value}
          placeholder="fx 18T WL 85663 12488"
          onChange={(e) => onChange(e.target.value, "manual")}
        />
        <button type="button" className={styles.smallButton} onClick={generate}>
          {t("fields.mgrs.generate")}
        </button>
      </div>
      {error && <p style={{ color: "var(--qo-color-mayday)", margin: 0, fontSize: "0.875rem" }}>{error}</p>}
      {source === "manual" && value && (
        <p style={{ fontSize: "0.75rem", opacity: 0.7, margin: 0 }}>{t("fields.gps.manuallyEdited")}</p>
      )}
      <p style={{ fontSize: "0.75rem", opacity: 0.6, margin: 0 }}>{t("fields.mgrs.disclaimer")}</p>
    </FieldWrapper>
  );
}
