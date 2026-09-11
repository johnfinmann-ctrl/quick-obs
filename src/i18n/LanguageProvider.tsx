import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { resolveString } from "./resolveString";
import { LanguageContext } from "./LanguageContext";
import type { LanguageCode } from "./types";
import { loadTranslationOverrides } from "../storage/translationOverrides";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("da");
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const loadOverridesForLanguage = useCallback((lang: LanguageCode) => {
    loadTranslationOverrides(lang).then(setOverrides);
  }, []);

  useEffect(() => {
    loadOverridesForLanguage(language);
  }, [language, loadOverridesForLanguage]);

  const refreshOverrides = useCallback(() => loadOverridesForLanguage(language), [language, loadOverridesForLanguage]);

  const t = useCallback((key: string) => resolveString(language, key, overrides).text, [language, overrides]);
  const tResolved = useCallback((key: string) => resolveString(language, key, overrides), [language, overrides]);

  const value = useMemo(
    () => ({ language, setLanguage, t, tResolved, refreshOverrides }),
    [language, t, tResolved, refreshOverrides],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
