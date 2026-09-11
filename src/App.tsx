import { useEffect, useState } from "react";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import { OptionOverridesProvider } from "./optionOverrides/OptionOverridesContext";
import { FormLibraryProvider } from "./formLibrary/FormLibraryProvider";
import { DemoBanner } from "./components/DemoBanner";
import { LanguageStatusBanner } from "./components/LanguageStatusBanner";
import { UpdatePrompt } from "./components/UpdatePrompt";
import { SettingsPanel } from "./components/SettingsPanel";
import { HomeScreen } from "./components/HomeScreen";
import { HurtigRapportForm } from "./components/forms/HurtigRapportForm";
import { MeldingsblanketForm } from "./components/forms/MeldingsblanketForm";
import { SitrepForm } from "./components/forms/SitrepForm";
import { NineLinerForm } from "./components/forms/NineLinerForm";
import { MistForm } from "./components/forms/MistForm";
import { DronemeldingForm } from "./components/forms/DronemeldingForm";
import { SarMeldingForm } from "./components/forms/SarMeldingForm";
import { HistoryView } from "./components/HistoryView";
import { AdminPanel } from "./components/AdminPanel";
import { ContactsView } from "./components/ContactsView";
import { FormLibraryView } from "./components/FormLibraryView";
import { DroneSurveillanceView } from "./components/DroneSurveillanceView";
import { DroneIncidentView } from "./components/DroneIncidentView";
import { openReportAsDraft } from "./storage/drafts";
import { loadSettings } from "./storage/settings";
import type { AppView, FormKind } from "./types";
import styles from "./App.module.css";

function AppContent() {
  const [view, setView] = useState<AppView>("home");
  const [incidentId, setIncidentId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings().then((s) => {
      if (s.startModule && s.startModule !== "home") {
        setView(s.startModule as AppView);
      }
    });
  }, []);

  const handleSelectForm = (kind: FormKind) => setView(kind);
  const handleBack = () => setView("home");

  async function handleOpenReport(kind: FormKind, reportId: string) {
    await openReportAsDraft(reportId, kind);
    setView(kind);
  }

  function handleCreateLinkedMist(_nineLinerReportId: string) {
    setView("mist");
  }

  function handleExpandHurtigRapport(target: FormKind) {
    setView(target);
  }

  let content;
  switch (view) {
    case "home":
      content = (
        <HomeScreen
          onSelectForm={handleSelectForm}
          onOpenFormLibrary={() => setView("form-library")}
          onOpenHistory={() => setView("history")}
        />
      );
      break;
    case "hurtig-rapport":
      content = <HurtigRapportForm onBack={handleBack} onExpand={handleExpandHurtigRapport} />;
      break;
    case "meldingsblanket":
      content = <MeldingsblanketForm onBack={handleBack} />;
      break;
    case "sitrep":
      content = <SitrepForm onBack={handleBack} />;
      break;
    case "nine-liner":
      content = <NineLinerForm onBack={handleBack} onCreateLinkedMist={handleCreateLinkedMist} />;
      break;
    case "mist":
      content = <MistForm onBack={handleBack} />;
      break;
    case "dronemelding":
      content = (
        <DronemeldingForm
          onBack={handleBack}
          onViewIncident={(id) => {
            setIncidentId(id);
            setView("drone-incident");
          }}
          onNavigateToSitrep={() => setView("sitrep")}
        />
      );
      break;
    case "sar-melding":
      content = <SarMeldingForm onBack={handleBack} />;
      break;
    case "history":
      content = <HistoryView onBack={handleBack} onOpenReport={handleOpenReport} />;
      break;
    case "admin":
      content = <AdminPanel onBack={handleBack} />;
      break;
    case "contacts":
      content = <ContactsView onBack={handleBack} />;
      break;
    case "form-library":
      content = <FormLibraryView onBack={handleBack} />;
      break;
    case "drone-surveillance":
      content = <DroneSurveillanceView onBack={handleBack} />;
      break;
    case "drone-incident":
      content = incidentId ? (
        <DroneIncidentView incidentId={incidentId} onBack={handleBack} />
      ) : (
        <HomeScreen
          onSelectForm={handleSelectForm}
          onOpenFormLibrary={() => setView("form-library")}
          onOpenHistory={() => setView("history")}
        />
      );
      break;
    default:
      content = (
        <HomeScreen
          onSelectForm={handleSelectForm}
          onOpenFormLibrary={() => setView("form-library")}
          onOpenHistory={() => setView("history")}
        />
      );
  }

  return (
    <div className={styles.shell}>
      <DemoBanner />
      <LanguageStatusBanner />
      <div className={styles.topBar}>
        <SettingsPanel
          onOpenHistory={() => setView("history")}
          onOpenAdmin={() => setView("admin")}
          onOpenContacts={() => setView("contacts")}
          onOpenDroneSurveillance={() => setView("drone-surveillance")}
        />
      </div>
      <main className={styles.main}>{content}</main>
      <UpdatePrompt />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <OptionOverridesProvider>
          <FormLibraryProvider>
            <AppContent />
          </FormLibraryProvider>
        </OptionOverridesProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
