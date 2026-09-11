import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { BackButton } from "./BackButton";
import { deleteReportWithMedia, listReports, newReportId, saveReport } from "../storage/reports";
import type { FormKind, Report } from "../types";
import { FORM_DEFINITIONS } from "../config/forms";
import { ExportBar } from "./ExportBar";
import { buildReportText, buildSitrepText, valuesLookAsSensitive } from "../utils/reportText";
import { MELDINGSBLANKET_SECTIONS } from "../config/fields/meldingsblanket";
import { HURTIG_RAPPORT_SECTIONS } from "../config/fields/hurtigRapport";
import { SITREP_SECTIONS } from "../config/fields/sitrep";
import { NINE_LINER_SECTIONS } from "../config/fields/nineLiner";
import { MIST_SECTIONS } from "../config/fields/mist";
import { DRONEMELDING_SECTIONS } from "../config/fields/dronemelding";
import { SAR_SECTIONS } from "../config/fields/sarMelding";
import styles from "./HistoryView.module.css";

const SECTIONS_BY_KIND = {
  "hurtig-rapport": HURTIG_RAPPORT_SECTIONS,
  meldingsblanket: MELDINGSBLANKET_SECTIONS,
  sitrep: SITREP_SECTIONS,
  "nine-liner": NINE_LINER_SECTIONS,
  mist: MIST_SECTIONS,
  dronemelding: DRONEMELDING_SECTIONS,
  "sar-melding": SAR_SECTIONS,
} as const;

interface HistoryViewProps {
  onBack: () => void;
  onOpenReport: (kind: FormKind, reportId: string) => void;
}

export function HistoryView({ onBack, onOpenReport }: HistoryViewProps) {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<FormKind | "">("");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function refresh() {
    setReports(await listReports());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = reports.filter((r) => {
    if (kindFilter && r.kind !== kindFilter) return false;
    if (query && !r.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  async function handleDelete(id: string) {
    if (!confirm(t("history.confirmDelete"))) return;
    await deleteReportWithMedia(id);
    refresh();
  }

  async function handleDuplicate(report: Report) {
    const now = new Date().toISOString();
    const copy: Report = {
      ...report,
      id: newReportId(),
      title: `${report.title} (${t("history.copySuffix")})`,
      createdAt: now,
      updatedAt: now,
    };
    await saveReport(copy);
    refresh();
  }

  return (
    <div className={styles.container}>
      <BackButton onClick={onBack} />
      <h1 className={styles.title}>{t("history.title")}</h1>

      <div className={styles.controls}>
        <input
          className={styles.input}
          placeholder={t("history.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className={styles.input} value={kindFilter} onChange={(e) => setKindFilter(e.target.value as FormKind | "")}>
          <option value="">{t("history.filterAll")}</option>
          {FORM_DEFINITIONS.map((f) => (
            <option key={f.kind} value={f.kind}>
              {t(f.titleId)}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && <p className={styles.empty}>{t("history.empty")}</p>}

      {filtered.map((report) => {
        const form = FORM_DEFINITIONS.find((f) => f.kind === report.kind)!;
        const sections = SECTIONS_BY_KIND[report.kind];
        return (
          <div key={report.id} className={styles.card}>
            <p className={styles.cardTitle}>{report.title}</p>
            <p className={styles.meta}>
              {t(form.titleId)} · {new Date(report.updatedAt).toLocaleString("da-DK")}
              {report.mediaIds.length > 0 ? ` · ${report.mediaIds.length} media` : ""}
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.button} onClick={() => onOpenReport(report.kind, report.id)}>
                {t("history.open")}
              </button>
              <button type="button" className={styles.button} onClick={() => handleDuplicate(report)}>
                {t("history.duplicate")}
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => setExpanded(expanded === report.id ? null : report.id)}
              >
                {t("history.export")}
              </button>
              <button type="button" className={styles.dangerButton} onClick={() => handleDelete(report.id)}>
                {t("history.delete")}
              </button>
            </div>
            {expanded === report.id && (
              <ExportBar
                title={`${t(form.titleId)} - ${report.id}`}
                buildText={() =>
                  report.kind === "sitrep"
                    ? buildSitrepText(report, sections, t, t(form.titleId))
                    : buildReportText(report, sections, t, t(form.titleId))
                }
                sensitive={valuesLookAsSensitive(report.values, report.mediaIds.length)}
                photoMediaIds={report.mediaIds}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
