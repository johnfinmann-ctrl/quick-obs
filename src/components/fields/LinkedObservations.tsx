import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./LinkedObservations.module.css";

export interface LinkedObservation {
  id: string;
  kind: string;
  description: string;
  gpsPosition: string;
  directionDistance: string;
  timestamp: string;
  certainty: "observed" | "reported" | "possible" | "unknown";
  note: string;
}

interface LinkedObservationsProps {
  value: LinkedObservation[];
  onChange: (value: LinkedObservation[]) => void;
}

const KIND_OPTIONS = [
  "person", "vehicle", "parkedVehicle", "antenna", "mast", "temporaryEquipment",
  "buildingOrContainer", "possibleLaunchSite", "possibleLandingSite", "possibleRelayPoint",
  "lightsOrSignals", "other",
];

const CERTAINTY_OPTIONS: LinkedObservation["certainty"][] = ["observed", "reported", "possible", "unknown"];

function newEntry(): LinkedObservation {
  return {
    id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: "person",
    description: "",
    gpsPosition: "",
    directionDistance: "",
    timestamp: "",
    certainty: "observed",
    note: "",
  };
}

/**
 * "Mulige tilknyttede observationer" - et repeterbart underfelt til
 * personer, koeretoejer, antenner, mulige relaepunkter m.v., der kan
 * knyttes til en droneobservation. Hver post skelner tydeligt mellem
 * direkte observeret, oplyst af anden person, mulig sammenhaeng og
 * ukendt - appen konkluderer aldrig selv en sammenhaeng.
 */
export function LinkedObservations({ value, onChange }: LinkedObservationsProps) {
  const { t } = useTranslation();

  function update(id: string, patch: Partial<LinkedObservation>) {
    onChange(value.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function remove(id: string) {
    onChange(value.filter((e) => e.id !== id));
  }

  function add() {
    onChange([...value, newEntry()]);
  }

  return (
    <div className={styles.list}>
      {value.map((entry) => (
        <div key={entry.id} className={styles.entry}>
          <div className={styles.row}>
            <select className={styles.input} value={entry.kind} onChange={(e) => update(entry.id, { kind: e.target.value })}>
              {KIND_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {t(`fields.dronemelding.linkedKind.${k}`)}
                </option>
              ))}
            </select>
            <select
              className={styles.input}
              value={entry.certainty}
              onChange={(e) => update(entry.id, { certainty: e.target.value as LinkedObservation["certainty"] })}
            >
              {CERTAINTY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {t(`fields.dronemelding.certainty.${c}`)}
                </option>
              ))}
            </select>
          </div>
          <textarea
            className={styles.input}
            placeholder={t("fields.dronemelding.linkedDescription")}
            value={entry.description}
            onChange={(e) => update(entry.id, { description: e.target.value })}
          />
          <div className={styles.row}>
            <input
              className={styles.input}
              placeholder={t("fields.common.gpsPosition")}
              value={entry.gpsPosition}
              onChange={(e) => update(entry.id, { gpsPosition: e.target.value })}
            />
            <input
              className={styles.input}
              placeholder={t("fields.dronemelding.linkedDirectionDistance")}
              value={entry.directionDistance}
              onChange={(e) => update(entry.id, { directionDistance: e.target.value })}
            />
            <input
              className={styles.input}
              type="datetime-local"
              value={entry.timestamp}
              onChange={(e) => update(entry.id, { timestamp: e.target.value })}
            />
          </div>
          <textarea
            className={styles.input}
            placeholder={t("fields.common.remarks")}
            value={entry.note}
            onChange={(e) => update(entry.id, { note: e.target.value })}
          />
          <button type="button" className={styles.deleteButton} onClick={() => remove(entry.id)} aria-label={t("fields.dronemelding.linkedDelete")}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" className={styles.addButton} onClick={add}>
        <Plus size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
        {t("fields.dronemelding.linkedAdd")}
      </button>
    </div>
  );
}
