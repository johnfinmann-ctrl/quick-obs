import { useContext } from "react";
import { LanguageContext } from "./LanguageContext";

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation skal bruges inden i en LanguageProvider");
  }
  return ctx;
}
