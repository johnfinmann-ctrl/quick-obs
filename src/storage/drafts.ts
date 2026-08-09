import { dbDelete, dbGet, dbPut, STORES } from "./db";
import type { Draft, FormKind, FormValues } from "../types";
import { getReport } from "./reports";

export async function loadDraft(kind: FormKind): Promise<Draft | undefined> {
  return dbGet<Draft>(STORES.drafts, kind);
}

export async function saveDraft(
  kind: FormKind,
  values: FormValues,
  mediaIds: string[],
): Promise<void> {
  const draft: Draft = { kind, values, mediaIds, updatedAt: new Date().toISOString() };
  await dbPut(STORES.drafts, draft);
}

export async function clearDraft(kind: FormKind): Promise<void> {
  await dbDelete(STORES.drafts, kind);
}

/** Bruges naar en gemt rapport aabnes fra Historik - laegger den ind som den aktive kladde for sin blankettype. */
export async function openReportAsDraft(reportId: string, kind: FormKind): Promise<void> {
  const report = await getReport(reportId);
  if (!report) return;
  const values: FormValues = {
    ...report.values,
    __reportId: report.id,
    __createdAt: report.createdAt,
  };
  await saveDraft(kind, values, report.mediaIds);
}
