import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { resolveString } from "./resolveString";
import { LanguageContext } from "./LanguageContext";
import type { LanguageCode } from "./types";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("da");

  const t = useCallback((key: string) => resolveString(language, key).text, [language]);
  const tResolved = useCallback((key: string) => resolveString(language, key), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t, tResolved }),
    [language, t, tResolved],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
