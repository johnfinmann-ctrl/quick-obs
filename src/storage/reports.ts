import { dbDelete, dbGet, dbGetAll, dbPut, STORES } from "./db";
import type { Report } from "../types";
import { deleteMedia } from "./media";

export async function listReports(): Promise<Report[]> {
  const all = await dbGetAll<Report>(STORES.reports);
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getReport(id: string): Promise<Report | undefined> {
  return dbGet<Report>(STORES.reports, id);
}

export async function saveReport(report: Report): Promise<void> {
  await dbPut(STORES.reports, report);
}

export async function deleteReport(id: string): Promise<void> {
  await dbDelete(STORES.reports, id);
}

/**
 * Sletter en rapport OG dens vedhaeftede mediefiler (foto/video/lyd) i
 * IndexedDB - MEN kun de mediefiler, som ingen andre rapporter ogsaa
 * refererer til (fx en duplikeret rapport, der deler mediefiler med sin
 * original), saa der ikke slettes medier under en anden rapport.
 */
export async function deleteReportWithMedia(id: string): Promise<void> {
  const [report, allReports] = await Promise.all([getReport(id), listReports()]);
  if (report) {
    const stillReferenced = new Set(
      allReports.filter((r) => r.id !== id).flatMap((r) => r.mediaIds),
    );
    for (const mediaId of report.mediaIds) {
      if (!stillReferenced.has(mediaId)) {
        await deleteMedia(mediaId);
      }
    }
  }
  await dbDelete(STORES.reports, id);
}

export function newReportId(): string {
  return `qo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
