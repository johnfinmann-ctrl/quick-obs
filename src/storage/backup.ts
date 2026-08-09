import { dbGetAll, dbPut, dbClear, STORES } from "./db";
import type { AppSettings, EmergencyContact, Report } from "../types";

/**
 * Lokal backup/import af rapporter, kontakter og indstillinger.
 * Mediefiler (foto/video) indgaar IKKE i JSON-backuppen (for at holde
 * filen haandterbar) - kun tekstdata. Dette er tydeligt angivet ved
 * eksport/import i admin-UI'et.
 */
export interface BackupPayload {
  version: 1;
  exportedAt: string;
  reports: Report[];
  contacts: EmergencyContact[];
  settings: AppSettings | null;
}

export async function exportBackup(): Promise<BackupPayload> {
  const [reports, contacts, settingsRows] = await Promise.all([
    dbGetAll<Report>(STORES.reports),
    dbGetAll<EmergencyContact>(STORES.contacts),
    dbGetAll<{ key: string } & AppSettings>(STORES.settings),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    reports,
    contacts,
    settings: settingsRows[0] ?? null,
  };
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  if (payload.version !== 1) {
    throw new Error("Ukendt backup-version. Kan ikke importeres.");
  }
  for (const report of payload.reports) {
    await dbPut(STORES.reports, report);
  }
  for (const contact of payload.contacts) {
    await dbPut(STORES.contacts, contact);
  }
  if (payload.settings) {
    await dbPut(STORES.settings, payload.settings);
  }
}

export async function resetDemoData(): Promise<void> {
  await Promise.all([
    dbClear(STORES.reports),
    dbClear(STORES.drafts),
    dbClear(STORES.media),
  ]);
}
