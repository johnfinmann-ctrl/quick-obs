import { dbGet, dbPut, STORES } from "./db";
import type { FormKind } from "../types";

const KEY = "form-library-overrides";

export interface FormLibraryOverride {
  active: boolean;
  sortOrder: number;
  highlighted?: boolean;
  color?: string;
}

export type FormLibraryOverrides = Partial<Record<FormKind, FormLibraryOverride>>;

export async function loadFormLibraryOverrides(): Promise<FormLibraryOverrides> {
  const row = await dbGet<{ key: string; values: FormLibraryOverrides }>(STORES.settings, KEY);
  return row?.values ?? {};
}

export async function saveFormLibraryOverrides(values: FormLibraryOverrides): Promise<void> {
  await dbPut(STORES.settings, { key: KEY, values });
}
