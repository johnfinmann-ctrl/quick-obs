import { dbGet, dbPut, STORES } from "./db";

const KEY = "option-label-overrides";

export async function loadOptionOverrides(): Promise<Record<string, string>> {
  const row = await dbGet<{ key: string; values: Record<string, string> }>(STORES.settings, KEY);
  return row?.values ?? {};
}

export async function saveOptionOverrides(values: Record<string, string>): Promise<void> {
  await dbPut(STORES.settings, { key: KEY, values });
}
