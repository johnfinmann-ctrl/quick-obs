import { useEffect, useState } from "react";
import { loadSettings } from "../storage/settings";
import type { AppSettings } from "../types";

/** Simpel hook til at laese de gemte app-indstillinger (fx mapEnabled) ved mount. */
export function useAppSettings(): AppSettings | null {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);
  return settings;
}
