# Quick-Obs

Hurtig observations- og meldingsstoette til feltbrug.

**TEKNISK DEMO - IKKE GODKENDT TIL OPERATIV BRUG.**

Dette er et helt selvstaendigt projekt. Det er ikke en fork, en afhaengighed
af, eller en aendring af SafetyScan International. Ingen kode, tekst, data,
branding, storage-noegler eller ID-formater er kopieret derfra - kun
generelle, offentligt kendte UI/UX-moenstre (kort forside, store knapper,
en-blanket-ad-gangen, lokal kladde) er brugt som inspiration.

## Status: Fase 1 (grundprojekt og design)

Denne fase indeholder:

- Nyt Vite + React + TypeScript-projekt
- Grundlaeggende PWA-metadata (manifest, neutralt ikon - ingen
  myndighedslogoer)
- Permanent demobanner
- Forside med fem store, konfigurationsstyrede blanketknapper
- Tomme formularskaller med formular-specifik demomaerkning
- Synligt tandhjulsikon til indstillinger (sprog, lys/moerkt felttema)
- i18n-struktur: dansk (fuldt demosprog), samt strukturelle stubs til
  groenlandsk (KL) og faeroesk (FO) med automatisk dansk fallback

Fase 1 indeholder **ikke**: faerdige militaere koder/logik, PIN,
kryptering, IndexedDB, PDF, GPS/MGRS, kamera/video, talegenkendelse,
noedopkald, automatisk sletning, backup/import, deling eller eksterne
API-kald. Disse tilfoejes i senere faser.

## Udvikling

```bash
npm install
npm run dev      # udviklingsserver
npm run build    # produktionsbuild (koerer tsc -b foerst)
npm run lint     # oxlint
```

## Sikkerhed og privatliv (demo-niveau)

- Ingen eksterne runtime-kald eller CDN-afhaengigheder
- Ingen analytics eller tracking
- Ingen cloud-synkronisering
- Al fremtidig lagring er lokal (IndexedDB, tilfoejes i Fase 3)

## Fase 1 - visuel kontrolrunde (dokumenteret)

Screenshots taget med Playwright/Chromium mod et lokalt production-build
(`vite preview`), gemt i `screenshots/`:

| Fil | Viser |
|---|---|
| `01-mobile-home-light-da.png` | Forside, mobil ~390x844, lys tilstand, dansk |
| `02-mobile-formshell-mist.png` | Åbnet formularskal (MIST) med demomærkning |
| `03-mobile-settings-panel.png` | Indstillingspanel (tandhjul), sprog + tema |
| `04-mobile-home-kl.png` | Forside efter sprogskift til Kalaallisut (KL) |
| `05-mobile-formshell-kl-fallback.png` | Formularskal i KL: dansk fallback-tekst + diskret "Oversættelse afventer godkendelse"-note |
| `06-mobile-home-dark-da.png` | Mørkt felttema, mobil |
| `07-ipad-portrait-home.png` | iPad stående (768x1024) |
| `08-ipad-landscape-home.png` | iPad liggende (1024x768) |
| `09-desktop-home.png` | Desktop (1440x900) |

**Fejl fundet og rettet under kontrolrunden:** `PendingTranslationNote`-
komponenten var bygget, men var ikke faktisk koblet ind i `FormShell`, saa
den diskrete "Oversaettelse afventer godkendelse"-note blev ikke vist ved
KL/FO-fallback. Rettet ved at lade `FormShell` bruge `tResolved()` for
titel og beskrivelse og rendere noten, naar `isPendingApproval` er sand.
Verificeret paa ny med screenshot 05 efter rettelsen.

Efter rettelsen er koert igen: `npx tsc -b` (0 fejl), `npm run build`
(succes), `npm run lint` (0 fejl, 4 stilistiske fast-refresh-advarsler).
