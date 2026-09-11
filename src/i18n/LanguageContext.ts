import { createContext } from "react";
import type { LanguageCode, ResolvedString } from "./types";

export interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  tResolved: (key: string) => ResolvedString;
  refreshOverrides: () => void;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
