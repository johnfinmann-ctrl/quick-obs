import { createContext } from "react";
import type { FormDefinition, FormKind } from "../types";
import type { FormLibraryOverride } from "../storage/formLibrary";

export interface FormLibraryContextValue {
  /** Effektive definitioner: FORM_DEFINITIONS flettet med gemte admin-overrides, sorteret. */
  definitions: FormDefinition[];
  /** Kun de aktive, i sorteret raekkefoelge - bruges paa forsiden. */
  activeDefinitions: FormDefinition[];
  setOverride: (kind: FormKind, patch: Partial<FormLibraryOverride>) => void;
  loaded: boolean;
}

export const FormLibraryContext = createContext<FormLibraryContextValue | null>(null);
