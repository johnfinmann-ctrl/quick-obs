import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { loadOptionOverrides, saveOptionOverrides } from "../storage/optionOverrides";
import { OptionOverridesContext } from "./context";

/**
 * Giver admin mulighed for at redigere de danske tekster for 9-Liner-koder
 * (og andre valgmuligheder) uden at genudrulle appen. Overrides gemmes
 * lokalt i IndexedDB og har forrang over standardteksten fra da.ts.
 */
export function OptionOverridesProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadOptionOverrides().then((o) => {
      setOverrides(o);
      setLoaded(true);
    });
  }, []);

  const setOverride = useCallback((labelId: string, text: string) => {
    setOverrides((prev) => {
      const next = { ...prev, [labelId]: text };
      saveOptionOverrides(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ overrides, setOverride, loaded }), [overrides, setOverride, loaded]);

  return <OptionOverridesContext.Provider value={value}>{children}</OptionOverridesContext.Provider>;
}
