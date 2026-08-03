/**
 * Dansk - fuldt demosprog.
 *
 * Faste operative udtryk (MAYDAY, MGRS, DTG, 9-LINER, MIST, osv.) er ikke
 * medtaget her - de oversaettes aldrig og skrives direkte i UI'et.
 */
export const da = {
  app: {
    name: "Quick-Obs",
    subtitle: "Hurtig observations- og meldingsstoette",
    demoBanner: "TEKNISK DEMO – IKKE GODKENDT TIL OPERATIV BRUG",
  },
  nav: {
    back: "Tilbage",
    settings: "Indstillinger",
    home: "Forside",
  },
  home: {
    formsHeading: "Vaelg blanket",
  },
  forms: {
    meldingsblanket: {
      title: "Meldingsblanket",
      description: "Generel observations- og hændelsesmelding.",
      disclaimer: "DEMOFORMAT – KRÆVER FAGLIG BEKRÆFTELSE",
    },
    nineLiner: {
      title: "9-Liner",
      description: "Anmodning om medicinsk evakuering, ni linjer.",
      disclaimer:
        "DEMOFORMAT BASERET PÅ OFFENTLIGT TCCC-MATERIALE – KRÆVER GODKENDELSE FRA FORSVARET",
    },
    mist: {
      title: "MIST",
      description: "Struktureret overlevering af tilskadekommen.",
      disclaimer:
        "DEMOFORMAT – MÅ IKKE ANVENDES TIL DIAGNOSE ELLER BEHANDLINGSBESLUTNING",
    },
    dronemelding: {
      title: "Dronemelding",
      description: "Observation af ukendt eller mistænkelig drone.",
      disclaimer:
        "IKKE VERIFICERET FORMAT – KRÆVER GODKENDELSE FRA FORSVARET/ARKTISK KOMMANDO",
    },
    sarMelding: {
      title: "SAR-melding",
      description: "Nødmelding eller SAR-observation til søs, på land eller i luften.",
      disclaimer:
        "Udfyldelse af blanketten må ikke forsinke et nødopkald eller en nødmelding over radio.",
    },
  },
  formShell: {
    placeholder: "Felterne til denne blanket tilfoejes i en senere fase.",
  },
  i18n: {
    /** Vises diskret, naar en godkendt oversaettelse mangler for KL/FO. */
    pendingApproval: "Oversættelse afventer godkendelse.",
  },
} as const;

export type TranslationShape = typeof da;
