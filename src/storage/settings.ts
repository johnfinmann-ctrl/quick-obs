import { dbGet, dbPut, STORES } from "./db";
import type { AppSettings } from "../types";

const SETTINGS_KEY = "app-settings";

export const DEFAULT_SETTINGS: AppSettings = {
  region: "auto",
  callsign: "",
  defaultLanguage: "da",
  theme: "light",
  pinHash: null,
  pinSalt: null,
  autoDeleteHours: 0,
  mapEnabled: true,
  startModule: "home",
  timeZoneMode: "auto",
  manualTimeZone: null,
};

export async function loadSettings(): Promise<AppSettings> {
  const stored = await dbGet<{ key: string } & AppSettings>(STORES.settings, SETTINGS_KEY);
  if (!stored) return DEFAULT_SETTINGS;
  const { key: _key, ...settings } = stored;
  return { ...DEFAULT_SETTINGS, ...settings };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await dbPut(STORES.settings, { key: SETTINGS_KEY, ...settings });
}
