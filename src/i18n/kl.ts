import type { DeepPartialTranslation } from "./types";

/**
 * Groenlandsk / Kalaallisut - strukturel sprogpakke.
 *
 * Bevidst efterladt tom i Fase 2. Kalaallisut er et grammatisk komplekst
 * (polysyntetisk) sprog, som ligger sprogligt langt fra dansk, og hvor
 * risikoen for fejlagtig maskingenereret tekst er markant hoejere end for
 * faeroesk. I en app der ogsaa daekker noed- og SAR-kommunikation vurderes
 * det mere ansvarligt IKKE at generere et sprogligt usikkert udkast, end
 * at risikere vildledende tekst - selv med en tydelig "udkast"-markering.
 *
 * Alle KL-tekster falder derfor bevidst tilbage til dansk med den
 * diskrete "Oversaettelse afventer godkendelse"-note, indtil en egentlig
 * oversaettelse udarbejdes sammen med en kalaallisut-talende fagperson
 * (anbefalet som naeste skridt, jf. README).
 */
export const kl: DeepPartialTranslation = {
  // Bevidst tom i Fase 2 - se begrundelse ovenfor.
};
