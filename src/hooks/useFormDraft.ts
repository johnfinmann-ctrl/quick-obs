import { useCallback, useEffect, useRef, useState } from "react";
import type { FormKind, FormValues, Report } from "../types";
import { loadDraft, saveDraft, clearDraft } from "../storage/drafts";
import { saveReport, newReportId, getReport } from "../storage/reports";
import { useTranslation } from "../i18n/useTranslation";

const AUTOSAVE_DELAY_MS = 600;

export interface UseFormDraftResult {
  values: FormValues;
  mediaIds: string[];
  loaded: boolean;
  lastSavedAt: string | null;
  setField: (id: string, value: unknown) => void;
  setMediaIds: (ids: string[]) => void;
  saveAsReport: () => Promise<Report>;
  discardDraft: () => Promise<void>;
  loadReportIntoDraft: (reportId: string) => Promise<void>;
}

/**
 * Delt hook til kladde-haandtering: indlaeser eksisterende kladde ved
 * aabning, autogemmer aendringer lokalt (debounced), og konverterer
 * kladden til en faerdig historik-post ved "Gem".
 */
export function useFormDraft(kind: FormKind): UseFormDraftResult {
  const { language } = useTranslation();
  const [values, setValues] = useState<FormValues>({});
  const [mediaIds, setMediaIdsState] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const draft = await loadDraft(kind);
      if (cancelled) return;
      setValues(draft?.values ?? {});
      setMediaIdsState(draft?.mediaIds ?? []);
      setLastSavedAt(draft?.updatedAt ?? null);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const scheduleAutosave = useCallback(
    (nextValues: FormValues, nextMediaIds: string[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        await saveDraft(kind, nextValues, nextMediaIds);
        setLastSavedAt(new Date().toISOString());
      }, AUTOSAVE_DELAY_MS);
    },
    [kind],
  );

  const setField = useCallback(
    (id: string, value: unknown) => {
      setValues((prev) => {
        const next = { ...prev, [id]: value };
        scheduleAutosave(next, mediaIds);
        return next;
      });
    },
    [mediaIds, scheduleAutosave],
  );

  const setMediaIds = useCallback(
    (ids: string[]) => {
      setMediaIdsState(ids);
      scheduleAutosave(values, ids);
    },
    [values, scheduleAutosave],
  );

  const saveAsReport = useCallback(async (): Promise<Report> => {
    const existingId = typeof values.__reportId === "string" ? values.__reportId : undefined;
    const id = existingId ?? newReportId();
    const now = new Date().toISOString();
    const { __reportId: _drop, ...cleanValues } = values as FormValues & { __reportId?: string };

    const report: Report = {
      id,
      kind,
      title: deriveTitle(kind, cleanValues),
      values: cleanValues,
      language,
      createdAt: (values.__createdAt as string) ?? now,
      updatedAt: now,
      mediaIds,
      linkedReportId: typeof values.linkedNineLiner === "string" ? values.linkedNineLiner : undefined,
      linkedReportIds: Array.isArray(values.linkedReportIds) ? (values.linkedReportIds as string[]) : undefined,
    };
    await saveReport(report);
    await clearDraft(kind);
    setValues({});
    setMediaIdsState([]);
    setLastSavedAt(null);
    return report;
  }, [kind, values, mediaIds, language]);

  const discardDraft = useCallback(async () => {
    await clearDraft(kind);
    setValues({});
    setMediaIdsState([]);
    setLastSavedAt(null);
  }, [kind]);

  const loadReportIntoDraft = useCallback(
    async (reportId: string) => {
      const report = await getReport(reportId);
      if (!report) return;
      const nextValues: FormValues = {
        ...report.values,
        __reportId: report.id,
        __createdAt: report.createdAt,
      };
      setValues(nextValues);
      setMediaIdsState(report.mediaIds);
      await saveDraft(kind, nextValues, report.mediaIds);
      setLastSavedAt(new Date().toISOString());
    },
    [kind],
  );

  return {
    values,
    mediaIds,
    loaded,
    lastSavedAt,
    setField,
    setMediaIds,
    saveAsReport,
    discardDraft,
    loadReportIntoDraft,
  };
}

function deriveTitle(kind: FormKind, values: FormValues): string {
  const candidates = [values.senderCallsign, values.observer, values.personId, values.who, values.what];
  const found = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
  const base =
    kind === "meldingsblanket"
      ? "Meldingsblanket"
      : kind === "nine-liner"
        ? "9-Liner"
        : kind === "mist"
          ? "MIST"
          : kind === "dronemelding"
            ? "Dronemelding"
            : "SAR-melding";
  return found ? `${base} - ${String(found).slice(0, 40)}` : base;
}
