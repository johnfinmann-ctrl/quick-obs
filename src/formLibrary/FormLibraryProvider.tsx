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
 * overrides for aktiv/inaktiv og sorteringsraekkefoelge, uden at aendre
 * selve konfigurationsfilen. Bruges af forsiden, Blanketbiblioteket og
 * formularskallerne.
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

  const setOverride = useCallback(
    (kind: FormKind, patch: Partial<FormLibraryOverride>) => {
      setOverrides((prev) => {
        const current = prev[kind] ?? {
          active: FORM_DEFINITIONS.find((f) => f.kind === kind)?.active ?? true,
          sortOrder: FORM_DEFINITIONS.find((f) => f.kind === kind)?.sortOrder ?? 0,
        };
        const next = { ...prev, [kind]: { ...current, ...patch } };
        saveFormLibraryOverrides(next);
        return next;
      });
    },
    [],
  );

  const definitions = useMemo(() => {
    return FORM_DEFINITIONS.map((def) => {
      const o = overrides[def.kind];
      return o ? { ...def, active: o.active, sortOrder: o.sortOrder } : def;
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [overrides]);

  const activeDefinitions = useMemo(() => definitions.filter((d) => d.active), [definitions]);

  const value = useMemo(
    () => ({ definitions, activeDefinitions, setOverride, loaded }),
    [definitions, activeDefinitions, setOverride, loaded],
  );

  return <FormLibraryContext.Provider value={value}>{children}</FormLibraryContext.Provider>;
}
