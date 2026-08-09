import type { DeepPartialTranslation } from "./types";

/**
 * Faeroesk / Foroyskt - OVERSAETTELSESUDKAST.
 *
 * Dette er et AI-genereret foersteudkast til de mest synlige tekster i
 * appen (forside, navigation, faelles felter, eksport, kontakter,
 * historik og administration). Det daekker IKKE alle blanketfelter
 * endnu (fx de detaljerede 9-Liner/MIST/Dronemelding/SAR-felter og
 * 9-Liner-koderne), som stadig falder tilbage til dansk med en diskret
 * note.
 *
 * AFVENTER KONTROL AF MODERSMÅLSTALENDE - maa IKKE praesenteres eller
 * behandles som en godkendt, faerdig oversaettelse foer en foeroeyskt-
 * talende fagperson har gennemgaaet og rettet teksten, saerligt for
 * SAR/noedkommunikation.
 */
export const fo: DeepPartialTranslation = {
  app: {
    subtitle: "Skjót eftirlits- og fráboðanarstuðul",
    demoBanner: "TEKNISKT DEMO – IKKI GOÐKENT TIL ROKSTRARBRÚK",
  },
  nav: {
    back: "Aftur",
    settings: "Stillingar",
    home: "Forsíða",
    history: "Søga",
    admin: "Umsiting",
  },
  home: {
    formsHeading: "Vel skjal",
  },
  forms: {
    meldingsblanket: {
      title: "Fráboðanarskjal",
      description: "Alment eftirlits- og hendingartilmæli.",
      disclaimer: "DEMOSNIÐ – KREVUR FAKLIGA STAÐFESTING",
    },
    nineLiner: {
      title: "9-Liner",
      description: "Umbøn um heilsuflutning, níggju linjur.",
      disclaimer:
        "DEMOSNIÐ BYGT Á ALMENT TCCC-EFNI – KREVUR GOÐKENNING FRÁ VARNARMÁLUM",
    },
    mist: {
      title: "MIST",
      description: "Skipað handaneftirgeving av skaddum persóni.",
      disclaimer: "DEMOSNIÐ – MÁ IKKI NÝTAST TIL DIAGNOSU EÐA MEÐFERÐARAVGERÐ",
    },
    dronemelding: {
      title: "Dronufráboðan",
      description: "Eftirlit av ókendari ella ivasamari drónu.",
      disclaimer: "IKKI STAÐFEST SNIÐ – KREVUR GOÐKENNING",
    },
    sarMelding: {
      title: "SAR-fráboðan",
      description: "Neyðarfráboðan ella SAR-eftirlit til sjós, á landi ella í lofti.",
      disclaimer:
        "Útfylling av skjalinum má ikki forsinka eitt neyðaropkall ella eina neyðarfráboðan yvir radio.",
    },
  },
  fields: {
    common: {
      senderCallsign: "Sendari/ropinavn",
      dtg: "DTG (dato/tíð-bólkur)",
      dtgHelp: "Verður sett sjálvvirkandi til núverandi tíð, men kann altíð rættast.",
      gpsPosition: "GPS-støða",
      gpsHelp: "Heinta sjálvvirkandi ella skriva sjálv/ur. Kann altíð rættast.",
      coordinates: "MGRS / koordinatar (skriva sjálv/ur)",
      coordinatesHelp: "Frítekstfelt til MGRS ella annað staðbundið snið.",
      remarks: "Aðrar viðmerkingar",
      media: "Myndir og video",
      ownAction: "Egin gjørd atferð higartil",
    },
    datetime: { now: "Nú" },
    select: { placeholder: "Vel..." },
    gps: {
      fetch: "Heinta GPS-støðu",
      loading: "Heintar...",
      error: "Kundi ikki heinta støðu. Skriva sjálv/ur.",
    },
    media: {
      takePhoto: "Tak mynd",
      recordVideo: "Tak video upp",
      chooseExisting: "Vel verandi",
      processing: "Viðgerð í gongd...",
      photo: "Mynd",
      video: "Video",
      compressed: "trýst saman staðbundið",
      delete: "Strika fílu",
    },
    meldingsblanket: {
      section: {
        afsender: "Sendari og tíð",
        indhold: "Innihald",
        position: "Støða",
        supplerende: "Umframt",
      },
      receiver: "Móttakari",
      who: "Hvør",
      what: "Hvat",
      where: "Hvar",
      when: "Nær",
      how: "Hvussu",
      assessment: "Ætlan/mat",
    },
  },
  formPage: {
    draftSavedAt: "Kladdi goymdur sjálvvirkandi kl.",
    save: "Goym",
    discard: "Strika kladda",
    saved: "Fráboðanin er goymd í søguni.",
    missingRequired: "Fyll út allar felti merkt við *.",
  },
  contacts: {
    title: "Neyðarsamband",
    empty: "Eingi virksom sambond í hesum bólki.",
    callNow: "RING NÚ",
    cancel: "Angra",
    lastVerified: "Seinast eftirkannað",
    region: {
      groenland: "Grønland",
      faeroeerne: "Føroyar",
      danmark: "Danmark",
      andet: "Annað",
    },
    domain: {
      maritim: "Sjóvegis",
      land: "Land",
      luft: "Luft",
      generel: "Alment",
    },
  },
  export: {
    copy: "Avrita tekst",
    share: "Být",
    downloadText: "Taka niður tekst",
    pdf: "Ger PDF",
    copied: "Avritað.",
    copyFailed: "Kundi ikki avrita.",
    shared: "Býtt.",
    downloaded: "Tekstfíla tikin niður.",
    pdfCreated: "PDF tikin niður.",
    sensitiveWarning:
      "Henda fráboðanin kann innihalda persónligar ella heilsuligar upplýsingar. Vilt tú halda fram?",
    cancel: "Angra",
    confirmContinue: "Halt fram",
    yes: "Ja",
  },
  history: {
    title: "Søga",
    search: "Leita...",
    filterAll: "Allar skjalstig",
    empty: "Ongar goymdar fráboðanir enn.",
    open: "Lat upp",
    duplicate: "Fjölfalda",
    export: "Útflyt",
    delete: "Strika",
    confirmDelete: "Strika hesa fráboðan varandi?",
    copySuffix: "kopi",
  },
  admin: {
    title: "Umsiting",
    lockNow: "Lása nú",
    pin: {
      title: "Umsiting - PIN",
      unlock: "Lat upp",
      wrong: "Skeivur PIN.",
      notMilitaryGrade: "Demo-PIN gevur ikki hermaligt goðkent trygd.",
      changeTitle: "Broyt PIN",
      newPinPlaceholder: "Nýggjur PIN (min. 4 tøl)",
      save: "Goym nýggjan PIN",
      changed: "PIN broytt.",
      tooShort: "PIN skal hava minst 4 tøl.",
    },
    translations: {
      title: "Umsetingarstøða",
      draftWarning: "UMSETINGARUPPKAST – BÍÐAR EFTIR EFTIRLITI FRÁ MÓÐURMÁLSTALARA",
    },
  },
};
