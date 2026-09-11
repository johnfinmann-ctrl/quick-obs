import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FORM_DEFINITIONS } from "../config/forms";
import {
  loadFormLibraryOverrides,
  saveFormLibraryOverrides,
  type FormLibraryOverride,
  type FormLibraryOverrides,
} from "../storage/formLibrary";
import type { FormKind } from "../types";
import { FormLibraryContext } from "./context";

/**
 * Flettar FORM_DEFINITIONS (statisk konfiguration) med admin-gemte
 * overrides for aktiv/inaktiv, sorteringsraekkefoelge, fremhaevning og
 * modulfarve, uden at aendre selve konfigurationsfilen. Bruges af
 * forsiden, Blanketbiblioteket og formularskallerne.
 */
export function FormLibraryProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<FormLibraryOverrides>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFormLibraryOverrides().then((o) => {
      setOverrides(o);
      setLoaded(true);
    });
  }, []);

  const setOverride = useCallback((kind: FormKind, patch: Partial<FormLibraryOverride>) => {
    setOverrides((prev) => {
      const base = FORM_DEFINITIONS.find((f) => f.kind === kind);
      const current = prev[kind] ?? { active: base?.active ?? true, sortOrder: base?.sortOrder ?? 0 };
      const next = { ...prev, [kind]: { ...current, ...patch } };
      saveFormLibraryOverrides(next);
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setOverrides({});
    saveFormLibraryOverrides({});
  }, []);

  const definitions = useMemo(() => {
    return FORM_DEFINITIONS.map((def) => {
      const o = overrides[def.kind];
      if (!o) return { ...def, highlighted: false };
      return {
        ...def,
        active: o.active,
        sortOrder: o.sortOrder,
        highlighted: o.highlighted ?? false,
        moduleColor: o.color ?? def.moduleColor,
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [overrides]);

  const activeDefinitions = useMemo(() => definitions.filter((d) => d.active), [definitions]);

  const value = useMemo(
    () => ({ definitions, activeDefinitions, setOverride, resetToDefaults, loaded }),
    [definitions, activeDefinitions, setOverride, resetToDefaults, loaded],
  );

  return <FormLibraryContext.Provider value={value}>{children}</FormLibraryContext.Provider>;
}
