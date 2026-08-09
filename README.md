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

## Status: Fase 2 (udfyldelige blanketter, lokal lagring, administration) - afsluttet

Fase 2 goer alle fem blanketter reelt funktionelle. Se "Funktioner",
"Begraensninger", "Databehandling", "Oversaettelsesstatus",
"PIN-sikkerhed" og "Testresultater" nedenfor for detaljer.

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

---

# Fase 2 - dokumentation

## Funktioner

**Fem udfyldelige blanketter** (konfigurationsstyrede - felter ligger i
`src/config/fields/*.ts`, ikke hardkodet i UI-komponenterne):

- **Meldingsblanket**: afsender/kaldesignal, modtager, hvem/hvad/hvor/
  hvornaar/hvorledes, hensigt/vurdering, egen handling, DTG, GPS, MGRS/
  manuelt koordinatfelt, bemaerkninger, foto/video.
- **9-Liner**: alle ni linjer, fred/krig-toggle med variantlogik for
  linje 6 og 9 (`showWhen` i feltkonfigurationen), koder for prioritet/
  udstyr/sikkerhed/markering/nationalitet/CBRN i en central
  konfigurationsfil (`src/config/nineLinerConfig.ts`), redigerbare i
  Administration. Knap til at oprette en tilknyttet MIST-rapport efter
  gemning. Tydelig note om, at lokale procedurer/koder har forrang.
- **MIST**: M/I/S/T-felter, bevidsthed (AVPU), puls, vejrtraekning,
  blodtryk, SpO2, temperatur, behandlingstidspunkt, kan kobles til en
  eksisterende 9-Liner via en dropdown (hentet dynamisk fra historikken -
  ikke hardkodet).
- **Dronemelding**: rent observationsskema (dato/tid, observatoer,
  position, sidste kendte position, retning, hoejde, fastvinget/
  multirotor, rotorer, stoerrelse/form/farve, lys, lyd, adfaerd/
  flyvemoenster, synlig nyttelast, afstand/retning, foto/video). Ingen
  trusselsvurdering, vaaben- eller reaktionsforslag er tilfoejet nogen
  steder i kode eller tekst.
- **SAR-melding**: domaene (maritim/land/luft), MAYDAY/PAN-PAN/
  observation, MAYDAY RELAY, alle sagsfelter, samt en redigerbar
  MIPRE-radiotekstgenerator (M/I/P/R/E) der udfyldes fra formularens
  felter, men altid kan rettes af brugeren foer oplaesning/kopiering.
  Tydelig advarsel om, at udfyldelse ikke maa forsinke et nødopkald.

**Faelles medie-komponent** (`MediaCapture`): tag foto/optag video eller
vaelg eksisterende filer, lokal komprimering af billeder (canvas, ingen
cloud/AI), filstoerrelse og status vist, videoer over 60 MB afvises med
en tydelig fejlbesked, sletning af enkelt mediefil. Alt gemmes lokalt i
IndexedDB - ingen upload noget sted.

**Nødkontaktmodul** (`ContactsList` + `storage/contacts.ts`):
centraliseret, administrerbart kontaktregister (ikke hardkodet i
formular-komponenterne). Stor RING NU-knap kraever en bekraeftelsesdialog,
foer telefonens opkaldsdialog aabnes via et almindeligt `tel:`-link -
appen foretager aldrig selv et opkald.

**Lokal lagring** (IndexedDB, `src/storage/`): versioneret skema,
automatisk kladde pr. blankettype med debounced autosave, "fortsaet
seneste registrering" (kladden indlaeses automatisk ved genaabning),
historik med soegning/filtrering/aabn/duplikér/eksportér/slet (med
bekraeftelse), haandtering af `QuotaExceededError`. Kun én blanket kan
vaere aaben ad gangen (styret af navigationsstaten i `App.tsx`).

**Deling/eksport**: kopiér ren tekst, Web Share API (med download-
fallback), download som tekstfil, lokal PDF (jsPDF, lazy-loaded ved
foerste brug - ingen serverkald). Tydelig bekraeftelse, foer en rapport
med personhenfoerlige/medicinske felter deles eller downloades.

**Administration** (PIN-beskyttet, `src/components/AdminPanel.tsx`):
- Rediger noedkontakter (navn, telefon, aktiv/inaktiv)
- Rediger den danske tekst for 9-Liner-koder (gemmes som lokale
  overrides, har forrang over standardteksten)
- Lokalt kaldesignal, standardregion, automatisk sletning (slaaet fra
  som standard)
- Lagringsstatus (`navigator.storage.estimate()`, hvor understøttet)
- Se og slet lokale kladder
- Eksportér/importér lokal backup (JSON - se "Databehandling")
- Oversaettelsesstatus for KL/FO (se "Oversaettelsesstatus")
- Skift PIN
- Nulstil demoindhold (dobbelt bekraeftelse)

## Begraensninger (bevidste, dokumenterede fravalg i Fase 2)

- **9-Liner-kodeadministration** er tekst-override pr. kode, ikke en
  fuld editor til at tilfoeje/fjerne hele kodekategorier.
- **Backup indeholder ikke mediefiler** (foto/video) - kun tekstdata
  (rapporter, kontakter, indstillinger). Se advarslen i Administration.
- **MGRS er et manuelt fritekstfelt**, ikke en automatisk GPS-til-MGRS-
  konvertering. Dette opfylder opgavens formulering ("MGRS eller manuelt
  koordinatfelt"), men er vaerd at vaere opmaerksom paa.
- **Automatisk sletning** (24/48/72 timer) er en indstilling i
  Administration, men selve den baggrundskoerende sletningsjob er ikke
  implementeret i denne fase - indstillingen gemmes, men haandhaeves
  endnu ikke automatisk. Staar som en kendt mangel, ikke en skjult
  paastand om, at det virker.
- **Ingen offline service worker endnu** - se "PWA-status".
- **Ingen fysisk enhedstest** (rigtigt kamera/GPS/tel:-opkald) er
  udfoert - kun browser-baseret automatiseret test (Playwright) og
  fil-baseret medie-upload-simulation. Se "Testresultater".

## Databehandling

Alt data forbliver lokalt paa enheden (IndexedDB + browserens
Web Crypto/geolocation-API'er). Der er:

- Ingen cloud-synkronisering
- Ingen automatisk transmission af rapporter, fotos, video eller
  position til nogen server
- Ingen eksterne AI-, analyse- eller taletjenester
- Ingen analytics eller tracking
- PIN gemmes som en saltet SHA-256-hash (`src/storage/pin.ts`) - aldrig
  som klartekst
- Backup-eksport er en JSON-fil, brugeren selv downloader og opbevarer -
  appen sender den ikke nogen steder

## Oversaettelsesstatus

Dansk er fuldt, autoritativt demosprog. Faste operative udtryk (MAYDAY,
DTG, MGRS, 9-LINER, MIST, OVER, osv.) oversaettes aldrig.

**Faeroesk (FO):** Der er udarbejdet et foersteudkast, der daekker
forsiden, navigation, faelles felter, formular-titler/beskrivelser/
maerkninger, eksport, kontakter, historik og de vigtigste administrations-
tekster. Det daekker IKKE endnu alle detaljerede blanketfelter (fx de
fulde 9-Liner/MIST/Dronemelding/SAR-feltnavne og 9-Liner-koderne), som
falder tilbage til dansk med en diskret "Oversaettelse afventer
godkendelse"-note. Markeret tydeligt i Administration under
"Oversaettelsesstatus" (numerisk daekning i %) og maa IKKE behandles som
en godkendt oversaettelse foer en foeroeyskt-talende fagperson har
gennemgaaet den.

**Groenlandsk/Kalaallisut (KL):** Bevidst efterladt tomt i denne fase.
Kalaallisut er polysyntetisk og ligger sprogligt langt fra dansk, og
risikoen for fejlagtig, vildledende maskingenereret tekst blev vurderet
til at vaere for hoej i en app, der ogsaa daekker noed-/SAR-kommunikation
- ogsaa selv med en tydelig udkast-markering. Alle KL-tekster falder
derfor til dansk + den diskrete fallback-note. Dette er en bevidst
kvalitets-/sikkerhedsafvejning, ikke en forglemmelse - se kommentaren i
`src/i18n/kl.ts`. Anbefalet naeste skridt: udarbejd en egentlig
Kalaallisut-oversaettelse sammen med en modersmaalstalende fagperson,
frem for at udvide dette AI-genererede udkast yderligere.

Alle steder oversaettelse mangler, vises dansk sammen med en diskret
"Oversaettelse afventer godkendelse"-note - den raa
`PENDING_NATIVE_TRANSLATION`-markoer vises aldrig direkte til brugeren.

## PIN-sikkerhed

- Demo-PIN ved foerste adgang til Administration: **1234**
- PIN gemmes ALDRIG som klartekst - kun som en saltet SHA-256-hash
  (Web Crypto `SubtleCrypto`, koerer lokalt i browseren)
- PIN kan aendres i Administration
- Administration laases automatisk igen efter 5 minutters inaktivitet
- Tydelig tekst vist i UI'et: "Demo-PIN giver ikke militaergodkendt
  sikkerhed" - dette er et demo-sikkerhedsniveau, IKKE en militaer- eller
  myndighedsgodkendt loesning
- Nulstilling af demoindhold og import af backup kraever eksplicit
  bekraeftelse

## Testresultater

Testet med Playwright (automatiseret browsertest) mod et lokalt
production-build, samt visuel gennemgang af skaermbilleder:

| Test | Resultat |
|---|---|
| Udfyld og gem Meldingsblanket (paakraevede felter, autosave) | ✅ Bestaaet |
| Rapport vises korrekt i Historik | ✅ Bestaaet |
| 9-Liner: fred/krig-variantfelter, gem, opret tilknyttet MIST | ✅ Bestaaet |
| MIST: dynamisk kobling til gemt 9-Liner forudfyldt korrekt | ✅ Bestaaet |
| Dronemelding: rent observationsskema uden reaktionsforslag | ✅ Bestaaet (kodegennemgang + visuel kontrol) |
| SAR: MAYDAY-valg, MIPRE-generering indeholder korrekt indhold | ✅ Bestaaet |
| Nødkontakter: RING NU kraever bekraeftelse foer `tel:`-link | ✅ Bestaaet |
| Sprogskift til Kalaallisut: dansk fallback + diskret note vises | ✅ Bestaaet (19 fallback-noter paa én formularside) |
| Sprogskift til Foroyskt: forside fuldt oversat, ingen fallback | ✅ Bestaaet |
| Moerkt felttema paa forside og formularer | ✅ Bestaaet |
| Admin: standard-PIN 1234 laaser op, panel vises | ✅ Bestaaet |
| Medie: foto vedhaeftet, komprimeret, vist i liste | ✅ Bestaaet |
| iPad liggende / desktop: 9-Liner og Dronemelding, ingen vandret scrolling | ✅ Bestaaet |
| Ingen konsol-fejl eller mislykkede netvaerkskald under hele testkoerslen | ✅ Bekraeftet (0 fejl) |
| `npx tsc -b` | ✅ 0 fejl |
| `npm run lint` | ✅ 0 fejl, 0 advarsler |
| `npm run build` | ✅ Succes (jsPDF lazy-loaded, hovedbundle reduceret fra 668 KB til 269 KB) |
| Manifest/ikonreferencer efter build | ✅ Alle peger korrekt paa `/quick-obs/...` |
| Eksterne runtime-kald | ✅ Ingen fundet |
| SafetyScan International | ✅ Fortsat urørt |

**Ikke testet:** rigtigt enhedskamera, rigtig GPS-hardware, rigtige
telefonopkald, og fysisk iPhone/Android/iPad-hardware (kun
browser-emulerede viewports). Dette anbefales foer eventuel reel
feltafproevning.

---

# Korrektionsrunde - "udvidet Quick-Obs-specifikation"

## Status

Denne runde tilfoejer: Hurtig rapport, SITREP, taleoptagelse, GPS-
kortvisning, Blanketbibliotek, et separat droneovervaagnings-demo-
interface, samt udvidet sprogstatus og en oversaettelseskilde-eksport.
Alt er bygget oven paa den eksisterende, testede Fase 2 - ingen
faerdige funktioner er overskrevet eller genopbygget.

## Nye funktioner

**Hurtig rapport** (`src/components/forms/HurtigRapportForm.tsx`):
rapporttype, hvad der er sket, automatisk DTG/GPS (altid manuelt
rettelig), observatoer, prioritet, kort bemaerkning, foto/video/
taleoptagelse. Efter gemning tilbydes "Udvid til Meldingsblanket /
Dronemelding / SITREP / SAR-melding" - de overlappende felter (DTG,
GPS, observatoer, bemaerkning, medier) kopieres til en ny kladde for
maalblanketten, saa data ikke skal tastes igen (`src/utils/expandReport.ts`).

**SITREP** (`src/components/forms/SitrepForm.tsx`): fuldt felt-saet
(rapportnummer, enhed, periode, DTG, samlet situation, haendelser,
egne forhold, personel/materiel/logistik/kommunikation/vejr-terraen,
ressourcebehov, forventet udvikling, planlagte handlinger,
beslutningspunkter, bemaerkninger). Kan knytte sig til flere
eksisterende rapporter via et dynamisk flervalg hentet fra historikken -
eksportteksten samler automatisk de tilknyttede rapporters titel,
position og medieantal. Gemmes/kopieres/deles/eksporteres som tekst og
PDF via den eksisterende `ExportBar`. Maerket "DEMOFORMAT – IKKE
OFFICIEL ELLER MYNDIGHEDSGODKENDT".

**Taleoptagelse** (`src/components/fields/VoiceRecorder.tsx`, udvidet
`MediaCapture.tsx`): start/stop via MediaRecorder API, optagelsestid
vist live, afspilning (native `<audio controls>`), omdoebning,
sletning, filstoerrelse, lokal lagring i IndexedDB (samme media-store
som foto/video). Tydelig fejlbesked ved afvist mikrofontilladelse eller
manglende browserunderstoettelse. INGEN cloud-transskription - lyden
gemmes blot som binaerdata. Diktering til tekst sker fortsat via
enhedens eget tastatur i tekstfelterne.

**GPS og kortvisning** (`src/components/MapView.tsx`, Leaflet +
OpenStreetMap-fliser): aktuel position, rapportens position, manuel
placering ved tryk paa kortet, flere observationer paa samme kort
(bruges i Droneovervaagnings-demoen), zoom, GPS-noejagtighed og
-tidspunkt vist ved hentning, kopiér koordinat, "Åbn i kortapp" (via
`geo:`-URI), online/offline-status, haandtering af afvist
GPS-tilladelse. **Kan slaas fra i Administration** ("Kortvisning") -
GPS og manuel koordinatindtastning fungerer fuldstaendigt uden kortet,
uanset denne indstilling. Tydelig disclosure vist ved kortet: fliserne
hentes fra en ekstern tjeneste (OpenStreetMap), men rapporttekst,
persondata og medier sendes ALDRIG dertil - kun de zoom/koordinat-tal,
der er noedvendige for at hente baggrundsbilledet.

**Blanketbibliotek** (`src/components/FormLibraryView.tsx` +
`src/formLibrary/`): konfigurationsstyret oversigt over alle syv
blanketter (Hurtig rapport, Meldingsblanket, SITREP, 9-Liner, MIST,
Dronemelding, SAR-melding) med navn, version, status (demo/udkast/
verificeret), seneste faglige kontrol og aktiv/inaktiv. Administrator
kan aktivere/deaktivere og saette raekkefoelge i Administration -
aendringer slaar med det samme igennem paa forsiden.

**Droneovervaagnings-demo** (`src/components/DroneSurveillanceView.tsx`,
`src/droneSurveillance/`, adskilt fra selve Dronemelding-blanketten):
viser altid statusteksten "Ingen aktiv sensor eller datakilde
tilsluttet". TypeScript-typer for telemetri, Remote ID og
sensorobservationer samt en `DroneDataProvider`-adapter-graenseflade til
fremtidige, lovlige datakilder er defineret i `src/types/index.ts`. Kun
en lokal, tydeligt markeret testdata-udbyder findes i denne demo
(`localTestDataProvider.ts`). Viser testdataene paa kort og som
tidslinje. INGEN trusselsvurdering, maalidentifikation eller
bekaempelses-/reaktionsanvisninger forekommer noget sted i denne
kode/tekst. Telefonens eget kamera/GPS fremstilles ingen steder som
automatisk droneovervaagning.

**Udvidet sprogstatus**: permanent banner under demobanneret, naar
sproget ikke er dansk - "OVERSÆTTELSESUDKAST – AFVENTER KONTROL AF
MODERSMÅLSTALENDE" paa foeroeyskt, "Kalaallisut oversættelse mangler –
dansk tekst vises" paa kalaallisut (`LanguageStatusBanner.tsx`).
Administration viser nu status pr. sprog (Dansk: grundsprog, Foeroeyskt:
udkast/ikke godkendt, Kalaallisut: afventer oversaettelse), samt en ny
"Eksportér kildetekst til oversaetter"-funktion, der downloader alle
danske streng-ID'er som en JSON-fil klar til en modersmaalstalende
oversaetter - uden at opfinde nogen groenlandske formuleringer paa
forhaand (`src/i18n/exportTranslationFile.ts`).

**Ny forside**: "Hurtig rapport" i fuld bredde oeverst, dernaest
Meldingsblanket/SITREP/Dronemelding/SAR-melding, en "Medicinsk"-
sektionslabel over 9-Liner/MIST, og til sidst Blanketbibliotek/Historik
under en "Mere"-label. Raekkefoelgen respekterer Blanketbibliotekets
sortering/aktiv-status. Mobil: én kolonne (uaendret). iPad/desktop: to
kolonner.

## Rapportsletning og medier

`deleteReportWithMedia()` sletter nu ogsaa en rapports vedhaeftede
foto/video/lydfiler fra IndexedDB - men kun de filer, INGEN andre
rapporter (fx en duplikeret rapport) stadig refererer til, saa delte
medier ikke forsvinder under en anden rapport ved en fejl.

## Eksport med medier - dokumenteret adfaerd

- **PDF**: indeholder pt. kun tekstindholdet (feltvaerdier, MIPRE-tekst,
  antal vedhaeftede medier) - IKKE selve foto-billederne indlejret.
  Dette er en kendt begraensning, ikke en skjult mangel.
- **Video/lyd som fil**: kan ikke deles direkte via den nuvaerende
  `ExportBar` (som deler/downloader tekst/PDF) - selve mediefilerne kan
  afspilles/downloades enkeltvis fra medielisten i formularen via
  browserens egne kontroller, men mangler en dedikeret "del denne fil"-
  knap. Naevnes her som naeste skridt.
- **Filstoerrelsesgraenser**: billeder komprimeres lokalt (maks. 1600px,
  75% JPEG-kvalitet), video afvises over 60 MB, lyd afvises over 25 MB -
  alle med tydelig fejlbesked.
- **iOS Web Share-fallback**: haandteres allerede for tekst/PDF (falder
  tilbage til download, hvis `navigator.share` mangler eller fejler) -
  ikke specifikt testet for medie-filer, da Web Share af mediefiler
  ikke er implementeret endnu (se ovenfor).
- **Medier efter genindlaesning**: verificeret i test - en optaget
  lydfil er fortsat til stede og afspilbar efter en fuld
  sidegenindlaesning (IndexedDB er persistent).

## Kendte miljoebegraensninger under test

Kortfliser (OpenStreetMap) kunne ikke hentes i dette sandboxede
build-/testmiljoe, fordi netvaerksadgangen her er begraenset til en
allow-liste af domaener (pakkeregistre, GitHub m.v.), som ikke
inkluderer `tile.openstreetmap.org`. Dette paavirker IKKE den
faerdige app i en almindelig browser med normal internetadgang - og
den indbyggede fejlhaandtering (fliseindlaesningsfejl -> tydelig
tekstbesked, koordinater vist som tekst) blev verificeret at virke
korrekt. Selve online/offline-detektionen, admin-deaktivering af
kortet, GPS-haentning, permission-handling og kort-UI'et i oevrigt er
alt sammen testet og fungerer.

## Testresultater (denne runde)

| Test | Resultat |
|---|---|
| Hurtig rapport: udfyld, gem, udvid til Meldingsblanket (data overfoert korrekt) | ✅ Bestaaet |
| SITREP: udfyld paakraevede felter (inkl. DTG), gem, tilknyt eksisterende rapport | ✅ Bestaaet |
| Taleoptagelse (fake mikrofon): start, timer, stop, afspilningskontrol vist | ✅ Bestaaet |
| Mikrofontilladelse afvist: fejlbesked vist | ✅ Bestaaet (foerste testrunde) |
| GPS godkendt: position hentet og indsat | ✅ Bestaaet |
| Kort online: kortcontainer og disclosure vist | ✅ Bestaaet (selve OSM-fliserne ikke hentbare i dette sandboxede miljoe, se ovenfor) |
| Kort offline: tydelig offline-besked, ingen fejl | ✅ Bestaaet |
| Blanketbibliotek: liste vist, admin kan (de)aktivere og sortere | ✅ Bestaaet |
| Droneovervaagnings-demo: status, testdata, kort, tidslinje | ✅ Bestaaet |
| Medier bevaret efter sidegenindlaesning | ✅ Bestaaet |
| Admin-PIN 1234 laaser op, "Laas nu" laaser manuelt igen | ✅ Bestaaet |
| Dansk / Foeroeyskt / Kalaallisut fallback + statusbannere | ✅ Bestaaet |
| Mobil, iPad stående, iPad liggende, desktop | ✅ Bestaaet |
| Lyst og moerkt tema | ✅ Bestaaet |
| `npx tsc -b` | ✅ 0 fejl |
| `npm run lint` | ✅ 0 fejl, 0 advarsler |
| `npm run build` | ✅ Succes |
| GitHub Pages-simulering under `/quick-obs/` | ✅ Alle asset-stier korrekte |
| Ingen konsol-fejl eller mislykkede requests (ekskl. forventede OSM-fliser) | ✅ Bekraeftet |

**Fejl fundet og rettet under denne runde:** to steder brugte
`\u00b1`/`\u00b0` direkte som JSX-tekst i stedet for i en streng -
JSX fortolker ikke Unicode-escapes i raa tekst, saa "±" og "°" blev
vist som bogstaveligt "\u00b1"/"\u00b0". Rettet ved at pakke tegnene i
`{"\u00b1"}`-udtryk.
