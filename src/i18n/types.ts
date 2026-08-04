import type { TranslationShape } from "./da";
import type { LanguageCode } from "../types";

/** Tillader kl.ts/fo.ts kun at udfylde de noegler, der faktisk er godkendt. */
export type DeepPartialTranslation = {
  [K in keyof TranslationShape]?: TranslationShape[K] extends object
    ? { [F in keyof TranslationShape[K]]?: Partial<TranslationShape[K][F]> }
    : TranslationShape[K];
};

export interface ResolvedString {
  /** Den tekst der skal vises (godkendt oversaettelse, ellers dansk fallback). */
  text: string;
  /** True hvis teksten er dansk fallback fordi en godkendt oversaettelse mangler. */
  isPendingApproval: boolean;
}

export type { LanguageCode };
