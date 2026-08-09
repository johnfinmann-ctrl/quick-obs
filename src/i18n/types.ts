import type { TranslationShape } from "./da";
import type { LanguageCode } from "../types";

/**
 * Rekursiv "deep partial" af oversaettelsestraeet, saa kl.ts/fo.ts kun
 * behoever udfylde de noegler, der faktisk har en godkendt/udkast-tekst -
 * uanset hvor dybt nøglen ligger i strukturen.
 */
export type DeepPartialTranslation = {
  [K in keyof TranslationShape]?: TranslationShape[K] extends string
    ? string
    : DeepPartialOf<TranslationShape[K]>;
};

type DeepPartialOf<T> = T extends string
  ? string
  : { [K in keyof T]?: DeepPartialOf<T[K]> };

export interface ResolvedString {
  /** Den tekst der skal vises (godkendt oversaettelse, ellers dansk fallback). */
  text: string;
  /** True hvis teksten er dansk fallback fordi en godkendt oversaettelse mangler. */
  isPendingApproval: boolean;
}

export type { LanguageCode };
