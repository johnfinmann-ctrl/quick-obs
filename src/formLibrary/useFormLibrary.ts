import { useContext } from "react";
import { FormLibraryContext } from "./context";

export function useFormLibrary() {
  const ctx = useContext(FormLibraryContext);
  if (!ctx) throw new Error("useFormLibrary skal bruges inden i FormLibraryProvider");
  return ctx;
}
