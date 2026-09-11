import { listReports } from "../storage/reports";
import type { Report } from "../types";

export function newIncidentId(): string {
  return `incident-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Alle Drone-Obs-rapporter, der deler samme haendelses-ID, sorteret efter DTG. */
export async function listIncidentReports(incidentId: string): Promise<Report[]> {
  const all = await listReports();
  return all
    .filter((r) => r.kind === "dronemelding" && r.values.incidentId === incidentId)
    .sort((a, b) => {
      const da = typeof a.values.dtg === "string" ? a.values.dtg : a.createdAt;
      const db = typeof b.values.dtg === "string" ? b.values.dtg : b.createdAt;
      return da.localeCompare(db);
    });
}
