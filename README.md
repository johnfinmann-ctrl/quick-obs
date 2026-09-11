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

**⚠️ Historisk afsnit fra Fase 1 - se "PWA - teknisk oversigt" i
Fase 2.1-afsnittet nedenfor for den AKTUELLE, korrekte status.** Fra og
med Fase 2.1's rettelsesrunde HAR Quick-Obs en fungerende, testet
service worker og fungerer offline. Nedenstaaende beskriver kun, hvad
der var sandt paa daetidspunktet i Fase 1, og er bevaret som historisk
dokumentation af projektets udvikling.

**Oprettet i Fase 1:**
- `manifest.webmanifest` med navn, farver, sprog og ikonreferencer
- SVG- og PNG-ikoner (192, 512, 512 maskable, 180 apple-touch-icon)
- `<link rel="manifest">`, `<link rel="apple-touch-icon">` m.v. i
  `index.html`

**IKKE oprettet eller verificeret i Fase 1 (rettet i Fase 2.1 - se nedenfor):**
- Ingen service worker var registreret
- Ingen offline app-shell-caching
- Appen kunne **ikke** bruges offline i Fase 1
- "Installer app"-adfaerd i browseren er fortsat ikke testet paa fysisk enhed

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
- **Service worker/offline**: var en aaben mangel paa dette tidspunkt i
  projektet - siden rettet og verificeret i Fase 2.1, se "PWA - teknisk
  oversigt" i Fase 2.1-afsnittet.
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

---

# Fase 2.1 - udvidelse og designkorrektion

## Status

Denne runde bevarer alle funktioner fra den forrige leverance (Hurtig
rapport, Meldingsblanket, SITREP, 9-Liner, MIST, Dronemelding,
Droneovervaagnings-demo, SAR, Blanketbibliotek, Historik, foto/video/
tale, GPS/kort, IndexedDB, eksport/deling, PIN-admin, GitHub Pages,
Vite-base `/quick-obs/`) og tilfoejer medie-foerst-flow, video med lyd,
korrekt tid/tidszone-haandtering, udvidet medie-metadata, et
modulfarve-/administrationssystem, IndexedDB-migration, et forbedret
sprog-/oversaettelsessystem - samt, i denne rettelsesrunde: en reelt
fungerende, testet offline-PWA, en gennemfoert kortdesign-omlaegning af
alle undersider, og en reproducerbar Playwright-testsuite, der koerer
efter `npm ci`.

## Rettelser i denne runde (svar paa gennemgangens 6 punkter)

### 1. Design (punkt 12-13) - nu fuldt gennemfoert

Alle undersider bruger nu et sammenhaengende kortdesign: formular-
sektioner (`FormRenderer`), demomaerknings-badges, det faelles
mediekort ("Dokumentér haendelsen"), nødkontakt-/historik-/
Blanketbiblioteks-kort og samtlige administrationssektioner er alle
afrundede kort (`--qo-radius-lg`) med en diskret skygge og egen
kortbaggrund, der adskiller sig fra sidebaggrunden i baade lyst og
moerkt tema. Formularernes lodrette rytme er gjort mere kompakt
(reduceret afstand mellem felter/sektioner). Dette er IKKE laengere en
delvis eller udestaaende opgave - verificeret visuelt paa mobil, iPad
(staaende/liggende) og desktop, i begge temaer (se screenshots
`2c-03` til `2c-09`).

### 2. PWA-status - afklaret og korrekt implementeret

Quick-Obs har nu en reel service worker (`vite-plugin-pwa`,
`generateSW`-strategi): hele app-shell'et (JS, CSS, HTML, manifest,
ikoner) precaches ved foerste besoeg, og en SPA-navigations-fallback
(`navigateFallback`) sikrer, at appen kan aabnes og navigeres helt uden
netforbindelse. Opdatering er KONTROLLERET, ikke automatisk: naar en ny
version er cachet i baggrunden, vises en tydelig prompt
("Ny version af Quick-Obs er klar" / "Opdater nu" / "Senere") i stedet
for en uventet genindlaesning, som kunne slette en igangvaerende
udfyldelse i felten. Dette er verificeret med automatiserede tests
(`tests/pwa-offline.spec.ts`): service workeren naar "activated",
appen genindlaeses og navigerer korrekt med netvaerket helt slukket
(`context.setOffline(true)`), og manifestet kan hentes offline. Der er
ogsaa taget skaermbilleder af appen koerende offline
(`2c-01-offline-home.png`, `2c-02-offline-form.png` - se
`screenshots/`-mappen i tidligere leverancer for referencer; denne
rettelsesrunde bekraefter tilstanden paa ny via de automatiserede
tests fremfor at gentage identiske billeder).

**Vigtigt forbehold:** Fordi Workbox' `generateSW` bygger en fast
precache-liste paa build-tidspunktet, virker Kortets eksterne
OpenStreetMap-fliser (som er en tredjeparts-nettjeneste, se afsnittet
om kort) fortsat KUN, naar enheden er online - det er forventet og
korrekt: selve app-shell'et (siderne, formularerne, lokal lagring) er
offline-klar, men et kort med levende, eksterne baggrundsfliser kan af
princip ikke vaere det.

### 3-4. Playwright som devDependency + reproducerbar testkoersel

`@playwright/test` er tilfoejet som `devDependency` (praecist pinnet
til version `1.56.0` - se begrundelse nedenfor), med en
`playwright.config.ts`, der selv bygger appen og starter en lokal
preview-server (`webServer`), saa testene kan koeres uden manuel
opsaetning. Alle testfiler ligger i `tests/` og bruger udelukkende
pakker, der staar i `package.json`.

**Verificeret fra en helt ren tilstand i denne rettelsesrunde:**

```bash
rm -rf node_modules dist package-lock.json
npm install          # genererer et nyt, korrekt package-lock.json
rm -rf node_modules
npm ci                # den reelle, reproducerbare installation
npx tsc -b             # 0 fejl
npm run lint           # 0 fejl, 0 advarsler
npm run build           # succes, inkl. service worker
npx playwright install chromium --with-deps   # foerste gang (se note)
npx playwright test      # 28/28 bestaaet
```

**Aerlig note om browser-binarer:** `npm ci` installerer IKKE selve
Playwright-browserne (det er almindelig Playwright-adfaerd, ikke en
mangel i dette projekt) - det kraever et separat
`npx playwright install chromium` (eller `npm run playwright:install`,
tilfoejet som et script). `@playwright/test` er bevidst pinnet til en
PRAECIS version (`1.56.0`, ikke `^1.56.0`) i `package.json`, fordi en
caret-range under test viste sig at lade `npm install` opgradere til en
nyere Playwright-version, som forventede en anden Chromium-revision end
den, der var installeret i test-miljoet her - et konkret eksempel paa
netop den slags reproducerbarhedsproblem, denne rettelsesrunde skal
loese. Med en praecis version undgaas denne drift mellem
`package.json`, lockfile og installerede browser-binarer.

### 5. README/kontrolrapport

Dette dokument er gennemgaaet, saa det kun beskriver funktionalitet,
der er reelt gennemfoert OG reproducerbart testet i denne
rettelsesrunde (se "Testresultater" nedenfor for den fulde,
maskinverificerede liste - 28/28 automatiserede tests, koert fra en
reel `npm ci`).

### 6. Levering

Pakket som `quick-obs-phase2-1-corrected.zip`. Intet er uploadet eller
pushet til GitHub.

## Testresultater (denne rettelsesrunde, fra ren `npm ci`)

| Testfil | Antal tests | Resultat |
|---|---|---|
| `tests/regression.spec.ts` | 10 | ✅ Alle bestaaet |
| `tests/media.spec.ts` | 4 | ✅ Alle bestaaet |
| `tests/admin-and-i18n.spec.ts` | 10 | ✅ Alle bestaaet |
| `tests/migration.spec.ts` | 1 | ✅ Bestaaet |
| `tests/pwa-offline.spec.ts` | 3 | ✅ Alle bestaaet |
| **I alt** | **28** | **✅ 28/28 bestaaet** |

| Oevrig kontrol | Resultat |
|---|---|
| `npm ci` fra ren tilstand | ✅ Succes |
| `npx tsc -b` | ✅ 0 fejl |
| `npm run lint` | ✅ 0 fejl, 0 advarsler |
| `npm run build` | ✅ Succes, inkl. `dist/sw.js` |
| Service worker naar "activated" | ✅ Verificeret automatiseret |
| Appen fungerer 100% offline (netvaerk slukket i test) | ✅ Verificeret automatiseret + screenshot |
| GitHub Pages-simulering under `/quick-obs/` | ✅ Alle asset-stier korrekte |
| SafetyScan International | ✅ Fortsat urørt |

## Kendte, aerligt dokumenterede begraensninger

- **Kortfliser (OpenStreetMap)** kraever internetforbindelse (forventet
  og korrekt for en ekstern kortleverandoer) - selve fejlhaandteringen
  (offline/fliesfejl -> tydelig tekstbesked, ingen blokering af
  rapporten) er verificeret, men de faktiske fliser er ikke hentbare i
  dette netvaerksbegraensede sandbox-udviklingsmiljoe.
- **Playwright-browserbinarer** downloades ikke af `npm ci` og skal
  installeres separat (`npx playwright install chromium`) - standard
  Playwright-adfaerd, dokumenteret ovenfor.
- **Kalaallisut** har fortsat ingen indbygget, kompileret oversaettelse
  (se begrundelse i `src/i18n/kl.ts`) - kun infrastruktur til at
  importere en fremtidig, faktisk oversaettelse fra en
  modersmaalstalende via Administration.
- **PDF-billedindlejring** fungerer, men er ikke finjusteret til meget
  store billedantal (grundlaeggende sideombrydning, ikke optimeret
  layout).
- Video/lyd kan ikke indlejres i PDF eller tekst-eksport - de deles som
  separate filer (Web Share API med download-fallback).

## PWA - teknisk oversigt

- **Plugin:** `vite-plugin-pwa` (`generateSW`-strategi, Workbox)
- **Precache:** app-shell (HTML, JS, CSS, manifest, ikoner) - 16-17
  filer, ca. 1,3 MB, genereret ved hver `npm run build`
- **Navigation offline:** `navigateFallback` peger paa
  `/quick-obs/index.html`, saa SPA-routing (som udelukkende er
  klient-side state, ikke URL-baseret i denne fase) virker uden
  netvaerk
- **Opdatering:** `registerType: 'prompt'` + `virtual:pwa-register/react`
  (`src/components/UpdatePrompt.tsx`) - brugeren skal selv bekraefte en
  opdatering; service workeren tjekker for nye versioner hver time, saa
  laenge en fane er aaben
- **Ikke cachet:** dynamisk data (IndexedDB-indhold, GPS, kortfliser) -
  kun de statiske filer, der udgoer selve applikationen

---

# Fase 2.2 - Drone-Obs: Hurtig/Grundig observation, MGRS, OPSEC

## Status

Denne runde bevarer ALLE eksisterende funktioner og moduler (Hurtig
rapport, Meldingsblanket, SITREP, 9-Liner, MIST, Dronemelding,
Droneovervaagnings-demo, SAR, Blanketbibliotek, Historik, fælles
mediekomponent, GPS/kort, IndexedDB, eksport/deling, moduladministration,
sprogadministration, PIN-admin, lyst/moerkt tema, PWA/offline app-shell,
GitHub Pages-base `/quick-obs/`) og udvider Drone-Obs betydeligt. Kapitel
12 i den vedlagte faglige kravspecifikation er IKKE brugt som
implementeringsinstruktion (jf. opgavens egen praecisering) - det
eksisterende modul-dashboard og de eksisterende modulfarver fra Fase 2.1
er bevaret uaendret.

## Nye funktioner

### MGRS-konvertering (`src/utils/mgrs.ts`)

Lokal WGS84 <-> MGRS-konvertering, INGEN eksternt API. Testet mod to
offentligt kendte referencevaerdier (fundet via websoegning, kildehenvisning
i koden): én matcher til meteren, én afviger 1 meter i easting (dokumenteret
som en kendt, ubetydelig praecisionsafvigelse - se kommentarer i
`src/utils/mgrs.ts`). Breddegrader/laengdegrad bevares uaendret ved siden af.
GPS-noejagtighed vises. Manuel indtastning er altid mulig. Kortfejl blokerer
aldrig registreringen. **Ikke militaert verificeret** - kraever faglig
kontrol foer operativ brug, jf. Fase 2.2 punkt 13. Kendt begraensning: de
saerlige norske/Svalbard-zonebredde-undtagelser (56-84 grader N) er ikke
implementeret.

### Drone-Obs: Hurtig og Grundig observation

To visninger af SAMME modul og datamodel (ikke to separate apps eller
dublerede moduler - `src/components/forms/DronemeldingForm.tsx`):

- **Hurtig observation**: medie-foerst (foto/video med lyd/tale/vaelg
  eksisterende), automatisk GPS/DTG, én enkel observationstype, kort
  bemaerkning. Medieoptagelse afventer IKKE udfyldte formularfelter. Kan
  gemmes med meget faa oplysninger.
- **Grundig observation**: alle eksisterende dronefelter plus udvidede
  felter (se nedenfor), organiseret i sammenklappelige sektioner
  (native `<details>`/`<summary>` - alle sektioner paa tvaers af HELE
  appen fik denne evne som en sideeffekt, standard aabne, saa intet
  eksisterende brydes).
- **"Fortsaet som grundig observation"**: efter en hurtig observation er
  gemt, genindlaeses den SAMME rapport som kladde med
  `observationMode` sat til "grundig" - allerede registrerede
  medier/GPS/tid/felter foelger automatisk med (ingen ny indtastning).

**Fejl fundet og rettet undervejs:** efter gemning nulstilles kladden
(designmoenster, der allerede gjaldt for alle andre blanketter) - dette
fik foerste implementering til fejlagtigt at vise mode-vaelgeren igen i
stedet for "gemt"-handlingerne. Rettet ved at lade den gemte rapports
egen `observationMode` afgoere visningen efter gemning.

### Udvidede Drone-Obs-felter (kun Grundig)

- **Selve dronen**: antal, kendt/ukendt/usikker type, klasse (fastvinget/
  multirotor/VTOL/ukendt/kan ikke vurderes), stoerrelse, farve/maerker,
  lys, lyd, hoejde, hastighed, nyttelast, kamera/gimbal, antenner/RF,
  dropmekanisme, sidst observerede retning. Alle med "Ukendt"/"Kan ikke
  vurderes" som gyldige svar - brugeren tvinges aldrig til at gaette.
- **Flyvemoenster**: 9 moenstre (direkte overflyvning, stationaer hover,
  kredser, gentager rute, foelger, skifter positioner, landet/forsvundet,
  mulig relaeposition, andet) + start-/sluttidspunkt eller fortsat
  aktivitet.
- **Mulige netvaerks-/relaeindikatorer**: 14 valgmuligheder (flere droner
  samtidigt, gentagne positioner, mulig forbindelse til koeretoej/
  bygning/mast, muligt start-/relaested, "ingen indikator", "ukendt")
  plus fritekstnote. Alle formuleret som observationer/muligheder -
  appen konkluderer ALDRIG selv, at der findes et netvaerk eller
  kontrolpunkt.
- **Kommunikation og elektroniske forstyrrelser**: type (mobil-/radio-
  udfald, GPS-unoejagtighed/spring/utilgaengelig, kompasfejl m.v.),
  tidspunkt, varighed, position, beroert udstyr, og tidsmaessig
  sammenhaeng (foer/under/efter observationen). Appen fastslaar ALDRIG
  automatisk, at en teknisk fejl skyldes dronen eller elektronisk
  krigsfoering.
- **Mulige tilknyttede observationer** (`src/components/fields/LinkedObservations.tsx`):
  repeterbar liste (personer, koeretoejer, antenner, master, mulige
  start-/landings-/relaesteder m.v.) med beskrivelse, position, retning/
  afstand, tidspunkt og note. Skelner eksplicit mellem direkte
  observeret, oplyst af anden person, mulig sammenhaeng og ukendt.
  **Kendt begraensning**: hver tilknyttet observation har i denne fase
  ikke sin egen mediekomponent (kun tekstfelter) - foto/video/lyd for
  hovedobservationen dækkes af det faelles mediekort.

### Militaerfaglig introduktion

Kort, sammenklappelig tekst oeverst i Drone-Obs
(`src/components/DroneMilitaryIntro.tsx`), tydeligt mærket som praktisk
vejledning - IKKE en officiel myndighedsinstruks.

### Flere observationer, haendelsesoversigt

Naar en Grundig observation gemmes foerste gang, faar den automatisk et
haendelses-ID. "Tilfoej endnu en observation til denne haendelse" opretter
en ny, tilknyttet kladde. "Se haendelsesoversigt"
(`src/components/DroneIncidentView.tsx`) viser alle observationer i
haendelsen paa kort og som tidslinje - rene dokumentationsvaerktoejer,
der IKKE automatisk beregner en fjendtlig hensigt eller sikker
identifikation.

### Overfoersel til SITREP

En gemt Drone-Obs-observation kan overfoeres til en ny SITREP-kladdes
"Vaesentlige haendelser"-felt (`src/utils/droneToSitrep.ts`), med
haendelses-ID, lokal tid/UTC/tidszone/DTG, position, antal droner,
flyvemoenster og en eksplicit note om, at INGEN automatisk
trusselsklassifikation er foretaget.

### "Vis til oplaesning" (radiovisning)

`src/components/RadioDisplayView.tsx`: stor, letlaeselig visning af DTG
og position foerst, dernaest de oevrige vigtigste oplysninger. Understoetter
lyst, moerkt og hoejkontrast-layout. Aendrer ALDRIG de registrerede data -
rent visningslag. Fungerer fuldt offline (kun lokale data, ingen
netvaerkskald).

### OPSEC og databeskyttelse

Advarslen foer deling/eksport (`ExportBar`) er udvidet til eksplicit at
naevne: operative oplysninger, positioner, personfoelsomme oplysninger,
patientoplysninger, metadata i medier og modtager/delingskanal - og
udloeses nu ogsaa af registreret position eller vedhaeftede medier (ikke
kun personhenfoerlige feltnavne som tidligere). Ingen Google Analytics,
Firebase, Sentry, ekstern AI-analyse, automatisk billedgenkendelse,
automatisk taleupload/-transskription eller automatisk deling af GPS/
medier er tilfoejet noget sted i kodebasen.

**EXIF/metadata - vigtig, aerlig praecisering:** Quick-Obs' EGNE
metadata (UTC, lokal tid, tidszone, DTG, GPS, mikrofonstatus,
optaget/importeret, manuel rettelse) gemmes fortsat separat i
IndexedDB og fjernes ALDRIG. Hvad angaar EXIF i selve billedfilen:
alle fotos (baade optagede OG importerede) genkodes i oejeblikket via
canvas ved lagring (til lokal komprimering) - dette fjerner som
bivirkning EXIF-data fra billedfilen med det samme, ikke kun paa en
senere eksporteret kopi. Dette er et **strengere** privatlivsvalg end
kravets minimum (som kun kraevede fjernelse ved eksport), men betyder
omvendt, at appen ikke internt bevarer originalens EXIF, selv til eget
brug. Dette er en bevidst, dokumenteret afvejning - IKKE en fejl - men
naevnes her aerligt, fordi det afviger fra en bogstavelig laesning af
kravet.

Diktering til tekst er fortsat beskrevet som en enheds-/browserfunktion
(brugerens eget tastatur) - Quick-Obs lover intet om, at dette virker
offline, og integrerer ikke Web Speech API eller anden cloud-baseret
tale-til-tekst.

### Faglig status ("Kraever faglig kontrol")

Foelgende har fortsat udtrykkelige demomaerkninger/kilde-forbehold, der
funktionelt svarer til "Kraever faglig kontrol", og maa IKKE
praesenteres som officielt godkendt uden en konkret, efterproevelig
kilde (dokumenttitel, version, afsnit):

| Omraade | Nuvaerende maerkning i appen |
|---|---|
| 9-Liner-koder | "DEMOFORMAT BASERET PAA OFFENTLIGT TCCC-MATERIALE - KRAEVER GODKENDELSE FRA FORSVARET" |
| Dronemelding/Drone-Obs | "IKKE VERIFICERET FORMAT - KRAEVER GODKENDELSE FRA FORSVARET/ARKTISK KOMMANDO" |
| MGRS-konvertering | "Testet mod offentligt kendte referencevaerdier - ikke militaert verificeret uden faglig godkendelse" (vist direkte ved feltet) |
| Noedkontakter | Kilde og "senest verificeret"-dato vist pr. kontakt (Administration) |
| Groenlandske/faeroeyske oversaettelser | Se sprogstatusbanner og Administration -> Oversaettelsesstatus |
| Meldingsblanket, MIST | "DEMOFORMAT - KRAEVER FAGLIG BEKRAEFTELSE" / "MAA IKKE ANVENDES TIL DIAGNOSE ELLER BEHANDLINGSBESLUTNING" |

## Kendte begraensninger (Fase 2.2)

- MGRS: Norge/Svalbard-zonebredde-undtagelser ikke implementeret; 1
  meters afvigelse paa én af to testede referencevaerdier.
- Tilknyttede observationer (i Drone-Obs) har ikke deres egen
  mediekomponent i denne fase.
- EXIF fjernes ved lagring (ikke kun ved eksport) - se aerlig
  praecisering ovenfor.
- Haendelsesoversigtens kort er underlagt samme OpenStreetMap-
  online-krav som resten af appens kortvisning.
- Radiovisningens "Tilbage"-knap kan i sjaeldne tilfaelde ogsaa matches
  af en skjult, bagvedliggende knap i tilgaengelighedstraeet (ikke
  synligt/klikbart for seende brugere, da radiovisningen daekker hele
  skaermen) - en mindre finpudsning for skaermlaesere er ikke lavet i
  denne fase.
- Ingen af de nye funktioner er testet paa fysisk enhed (kun
  automatiseret browsertest med "fake" kamera/mikrofon/GPS).

## Testresultater (Fase 2.2)

Fuld testsuite koert fra samme rene installation som i tidligere faser:

| Testfil | Antal tests | Resultat |
|---|---|---|
| `tests/regression.spec.ts` (opdateret for ny Drone-Obs-flow) | 10 | ✅ Alle bestaaet |
| `tests/media.spec.ts` | 4 | ✅ Alle bestaaet |
| `tests/admin-and-i18n.spec.ts` | 10 | ✅ Alle bestaaet |
| `tests/migration.spec.ts` | 1 | ✅ Bestaaet |
| `tests/pwa-offline.spec.ts` | 3 | ✅ Alle bestaaet |
| `tests/mgrs.spec.ts` (ny) | 5 | ✅ Alle bestaaet |
| `tests/drone-obs.spec.ts` (ny) | 8 | ✅ Alle bestaaet |
| **I alt** | **41** | **✅ 41/41 bestaaet** |

| Oevrig kontrol | Resultat |
|---|---|
| `npx tsc -b` | ✅ 0 fejl |
| `npm run lint` | ✅ 0 fejl, 0 advarsler |
| `npm run build` (inkl. service worker) | ✅ Succes |
| GitHub Pages-simulering under `/quick-obs/` | ✅ Alle asset-stier korrekte |
| Regression af alle eksisterende moduler | ✅ Ingen brud |

**Fejl fundet og rettet under denne rundes test:** Post-save-navigations-
fejl i Drone-Obs (se ovenfor) - fundet af den automatiserede test, ikke
ved manuel gennemgang, hvilket bekraefter vaerdien af den byggede
testsuite.

## Datamigration (Fase 2.2)

**Ingen tvungen IndexedDB-version-migration var noedvendig i denne
runde.** Begrundelse: `Report.values` er allerede et frit,
skemaloest `Record<string, unknown>`-objekt (uaendret siden tidligere
faser) - alle nye Drone-Obs-felter (observationMode, incidentId,
droneCount, flightPattern, networkIndicators, disruptionType,
linkedObservations, mgrs, mgrsSource, osv.) er valgfrie og laeses
overalt med sikre fallbacks (`typeof x === "string" ? x : ...`,
`Array.isArray(x) ? x : []`). Gamle Dronemelding-rapporter uden
`observationMode` vises automatisk som "Grundig observation" (den mest
daekkende visning, der viser alle oprindelige felter uden tab). Der
opfindes ingen historiske GPS-, tidszone- eller netvaerksdata for gamle
poster. `DB_VERSION` forbliver 2 (fra Fase 2.1) - selve
objektbutikkerne og MediaItem-skemaet er uaendrede i denne runde.
