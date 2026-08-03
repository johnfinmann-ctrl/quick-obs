# Quick-Obs

Hurtig observations- og meldingsstoette til feltbrug.

**TEKNISK DEMO - IKKE GODKENDT TIL OPERATIV BRUG.**

Dette er et helt selvstaendigt projekt. Det er ikke en fork, en afhaengighed
af, eller en aendring af SafetyScan International. Ingen kode, tekst, data,
branding, storage-noegler eller ID-formater er kopieret derfra - kun
generelle, offentligt kendte UI/UX-moenstre (kort forside, store knapper,
en-blanket-ad-gangen, lokal kladde) er brugt som inspiration.

## Status: Fase 1 (grundprojekt og design) - afsluttet

Denne fase indeholder:

- Nyt Vite + React + TypeScript-projekt, modulaer struktur
- PWA-installationsmetadata (se "PWA-status" nedenfor for hvad det
  faktisk daekker)
- Permanent demobanner
- Forside med fem store, konfigurationsstyrede blanketknapper -
  responsivt layout fra mobil til desktop (se "Layout" nedenfor)
- Tomme formularskaller med formular-specifik demomaerkning
- Synligt tandhjulsikon til indstillinger (sprog, lys/moerkt felttema)
- i18n-struktur: dansk (fuldt demosprog), samt strukturelle stubs til
  groenlandsk (KL) og faeroesk (FO) med automatisk dansk fallback og
  diskret oversaettelses-note

Fase 1 indeholder **ikke**: faerdige militaere koder/logik, PIN,
kryptering, IndexedDB, PDF, GPS/MGRS, kamera/video, talegenkendelse,
noedopkald, automatisk sletning, backup/import, deling eller eksterne
API-kald. Disse tilfoejes i senere faser.

## PWA-status (vigtigt - laes foer det antages, at appen er offline-klar)

**Oprettet i Fase 1:**
- `manifest.webmanifest` med navn, farver, sprog og ikonreferencer
- SVG- og PNG-ikoner (192, 512, 512 maskable, 180 apple-touch-icon)
- `<link rel="manifest">`, `<link rel="apple-touch-icon">` m.v. i
  `index.html`

**IKKE oprettet eller verificeret endnu:**
- Ingen service worker er registreret
- Ingen offline app-shell-caching
- Appen kan **ikke** bruges offline i den nuvaerende fase
- "Installer app"-adfaerd i browseren er ikke testet paa fysisk enhed

Fuld offline-PWA (service worker, cache-strategi, app-shell) er planlagt
til Fase 7 og maa foerst beskrives som "offline-klar", naar det er
implementeret og verificeret der.

## Layout - responsivt fra mobil til desktop

- **Mobil** (under ~720px): én kolonne, uaendret fra den oprindelige,
  kompakte mobiludgave
- **iPad staaende** (fra 720px): to kolonner, `--qo-max-content-width: 720px`
- **iPad liggende / desktop** (fra 1000px): to kolonner,
  `--qo-max-content-width: 860px`, samt lidt stoerre typografi og
  knapper, saa indholdet udnytter den bredere skaerm i stedet for at
  fremstaa som en lille mobilskaerm midt paa en stor tom flade
- Den femte knap (SAR-melding) star alene i venstre kolonne ved ulige
  antal blanketter - den straekkes ikke over begge kolonner

## Moerkt felttema - kontrast

Overskrifter ("Quick-Obs", blankettitler) og tilbageknappen bruger en
saerskilt `--qo-color-heading`-token, som i moerkt tema skifter fra den
moerkegroenne `--qo-color-primary` til en lysere groen (`#A9D9A0`), maalt
til et kontrastforhold paa ca. 11:1 mod baggrunden `#121811` (bestaar
WCAG AA og AAA for baade normal og stor tekst). Demomaerkningsbadges
(fx paa 9-Liner/MIST) bruger nu solide pastelbaggrunde i stedet for
gennemsigtige overlays, saa de forbliver laesbare uanset tema.

## PNG-ikoner

Genereret lokalt fra det eksisterende `public/icons/icon.svg` med
biblioteket `sharp` - ingen eksterne tjenester og intet andet ikon er
hentet. Se `scripts/generate-icons.mjs`. Koer igen med:

```bash
npm install
node scripts/generate-icons.mjs
```

Filer:
- `public/icons/icon.svg` - originalt SVG-ikon (bevaret)
- `public/icons/icon-maskable.svg` - full-bleed variant til maskable PNG
- `public/icons/apple-touch-icon.png` (180x180)
- `public/icons/icon-192.png` (192x192)
- `public/icons/icon-512.png` (512x512)
- `public/icons/icon-512-maskable.png` (512x512, purpose: maskable)

## Publicering til GitHub Pages

Quick-Obs er klargjort til at koere som et GitHub Pages-projekt-site paa:

**https://johnfinmann-ctrl.github.io/quick-obs/**

Dette kraever, at repositoryet hedder praecis `quick-obs`, fordi Vite er
bygget med `base: "/quick-obs/"` (se `vite.config.ts`), og
`manifest.webmanifest` har `start_url`/`scope` sat til `/quick-obs/`.

### Saadan publiceres den (foerste gang)

1. Opret et nyt, tomt repository paa GitHub med navnet **quick-obs**
   under kontoen `johnfinmann-ctrl` (tilfoej ikke README/.gitignore fra
   GitHub's side - dette projekt har allerede sine egne).
2. Fra dette projekts rodmappe:
   ```bash
   git init
   git add .
   git commit -m "Quick-Obs - Fase 1"
   git branch -M main
   git remote add origin https://github.com/johnfinmann-ctrl/quick-obs.git
   git push -u origin main
   ```
3. Gaa til repositoryets **Settings → Pages**.
4. Under "Build and deployment" → **Source**, vaelg **GitHub Actions**
   (ikke "Deploy from a branch").
5. Afvent at workflowet `.github/workflows/deploy.yml` koerer faerdigt
   under fanen **Actions** (typisk 1-2 minutter).
6. Aabn **https://johnfinmann-ctrl.github.io/quick-obs/**.

### Ved senere aendringer

Et almindeligt `git push` til `main` udloeser automatisk workflowet igen
og genudgiver siden. Workflowet kan ogsaa koeres manuelt fra
**Actions → Deploy Quick-Obs to GitHub Pages → Run workflow**.

### Hvad workflowet goer (`.github/workflows/deploy.yml`)

Henter repositoryet, installerer dependencies med `npm ci`, koerer
`npm run build` (som inkluderer `tsc -b` foer `vite build`), uploader
`dist/`-mappen som et Pages-artifact og deployer den med GitHub's
officielle `actions/deploy-pages`. Bruger kun det indbyggede
`GITHUB_TOKEN` - ingen hemmelige noegler er noedvendige eller anvendt.

### Vigtigt for senere faser

Fase 1 har ingen klient-side routing (kun intern komponent-state), saa
direkte genindlaesning af `/quick-obs/` virker uden videre paa statisk
hosting. Hvis en senere fase introducerer URL-baseret routing (fx til
enkelte blanketter), skal der tilfoejes en `404.html`-fallback-strategi,
for at direkte genindlaesning af dybe stier ikke giver 404 paa GitHub
Pages. Dette er ikke noedvendigt i Fase 1 og er derfor ikke tilfoejet nu.

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

### Foerste runde

Screenshots taget med Playwright/Chromium mod et lokalt production-build
(`vite preview`), gemt i `screenshots/`. Fejl fundet og rettet:
`PendingTranslationNote`-komponenten var bygget, men ikke koblet ind i
`FormShell`, saa den diskrete KL/FO-fallback-note manglede. Rettet ved at
lade `FormShell` bruge `tResolved()`.

### Anden runde (afsluttende rettelser)

Efter tilbagemelding blev foelgende rettet og verificeret paa ny med nye
screenshots (se filliste nedenfor):

1. **Layout paa iPad liggende/desktop** var for smalt og saa forladt ud
   paa store skaerme - rettet med bredere `--qo-max-content-width` fra
   1000px og opefter, stoerre typografi/knapper, uaendret mobiludgave.
2. **Kontrast i moerkt tema** - "Quick-Obs"-titlen, blanket-titler,
   tilbageknappen og demomaerkningsbadges havde for lav eller i nogle
   tilfaelde helt utilstraekkelig kontrast (badges var naesten ulaeselige
   i moerkt tema, da de brugte gennemsigtige overlays paa den moerke
   sidebaggrund). Rettet med en `--qo-color-heading`-token og solide
   badge-baggrunde. Maalt kontrastforhold ca. 11:1 for titlen.
3. **PNG-ikoner** genereret lokalt med `sharp` (se ovenfor).
4. **PWA-status** i README skelner nu tydeligt mellem manifest/ikoner
   (oprettet) og service worker/offline (endnu ikke lavet).
5. **Lint-advarsler** løst ved at splitte `i18n/index.tsx` og
   `theme/ThemeProvider.tsx` (som blandede komponent- og
   hook/konstant-eksporter) i separate filer:
   `i18n/LanguageContext.ts`, `i18n/LanguageProvider.tsx`,
   `i18n/useTranslation.ts`, `i18n/languages.ts`, `i18n/resolveString.ts`
   samt `theme/ThemeContext.ts`, `theme/ThemeProvider.tsx`,
   `theme/useTheme.ts`. `npm run lint` giver nu **0 fejl, 0 advarsler**.

Nye screenshots (`screenshots/`, filnavne prefikset `10-` til `16-`):

| Fil | Viser |
|---|---|
| `10-mobile-home-light.png` | Mobil 390x844, lyst tema (uaendret enkel opbygning) |
| `11-mobile-home-dark.png` | Mobil 390x844, moerkt tema - laesbar titel |
| `12-ipad-portrait-home.png` | iPad staaende, to kolonner |
| `13-ipad-landscape-home.png` | iPad liggende, bredere layout |
| `14-desktop-home.png` | Desktop, bredere layout (~860px indhold) |
| `15-settings-panel.png` | Indstillingspanel |
| `16-formshell-dark.png` | Formularskal (MIST) i moerkt tema - badge og titel laesbare |

Endelig kontrol efter rettelserne: `npx tsc -b` (0 fejl), `npm run build`
(succes), `npm run lint` (0 fejl, 0 advarsler), manifest/ikon-kontrol,
kontrol af eksterne runtime-kald, og kontrol af at SafetyScan
International fortsat ikke er rørt.

### Tredje runde - GitHub Pages-klargøring

Projektet gav 404 på `https://johnfinmann-ctrl.github.io/quick-obs/`,
fordi der ikke fandtes en Pages-workflow, og alle asset-/manifeststier
var absolutte fra domænets rod (`/...`) i stedet for undermappen
`/quick-obs/`. Rettet:

- `vite.config.ts`: tilføjet `base: "/quick-obs/"`
- `index.html`: ikon-/manifest-links ændret til `%BASE_URL%...`
- `manifest.webmanifest`: `start_url`/`scope` → `/quick-obs/`,
  ikonstier gjort relative (`icons/icon.svg` osv.)
- Ny fil `.github/workflows/deploy.yml`: bygger med `npm ci` +
  `npm run build` og deployer `dist/` med GitHub's officielle
  `actions/configure-pages`, `actions/upload-pages-artifact`,
  `actions/deploy-pages`. Ingen hemmelige nøgler.

**Verifikation:** `npm run build` kørt med den nye base, og den
genererede `dist/index.html` bekræftet at pege udelukkende på
`/quick-obs/...` for JS, CSS, manifest og ikoner. Derudover blev hele
`dist/`-mappen kopieret ind i en lokal mappestruktur, der efterligner
GitHub Pages' undermappe-layout (`/quick-obs/...`), serveret med en
lokal statisk server, og gennemgået med Playwright: siden loader uden
konsol-fejl og uden mislykkede netværkskald (screenshot
`17-github-pages-simulated.png`). Direkte genindlæsning af
`/quick-obs/` blev testet og returnerer HTTP 200 (ingen klient-side
routing i Fase 1, så dette er ikke et problem endnu - se note i
"Publicering til GitHub Pages" ovenfor).

Da denne samtale ikke har adgang til et forbundet GitHub-repository, er
der ikke pushet noget - projektet leveres som
`quick-obs-phase1-github-pages.zip` med den ovenstående
publiceringsvejledning.
