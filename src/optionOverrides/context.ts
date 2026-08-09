import { createContext } from "react";

export interface OptionOverridesValue {
  overrides: Record<string, string>;
  setOverride: (labelId: string, text: string) => void;
  loaded: boolean;
}

export const OptionOverridesContext = createContext<OptionOverridesValue | null>(null);
