import { useContext } from "react";
import { OptionOverridesContext } from "./context";
import { useTranslation } from "../i18n/useTranslation";

/** Returnerer den override-tekst, admin har gemt for et labelId, ellers den normale oversaettelse. */
export function useOptionLabel() {
  const ctx = useContext(OptionOverridesContext);
  const { t } = useTranslation();
  return (labelId: string) => ctx?.overrides[labelId] || t(labelId);
}

export function useOptionOverrides() {
  const ctx = useContext(OptionOverridesContext);
  if (!ctx) throw new Error("useOptionOverrides skal bruges inden i OptionOverridesProvider");
  return ctx;
}
