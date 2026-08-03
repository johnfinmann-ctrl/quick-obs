import { useState } from "react";
import { LanguageProvider } from "./i18n";
import { ThemeProvider } from "./theme/ThemeProvider";
import { DemoBanner } from "./components/DemoBanner";
import { SettingsPanel } from "./components/SettingsPanel";
import { HomeScreen } from "./components/HomeScreen";
import { FormShell } from "./components/FormShell";
import { FORM_DEFINITIONS } from "./config/forms";
import type { AppView, FormKind } from "./types";
import styles from "./App.module.css";

function AppContent() {
  const [view, setView] = useState<AppView>("home");

  const activeForm =
    view === "home" ? null : FORM_DEFINITIONS.find((f) => f.kind === view) ?? null;

  const handleSelectForm = (kind: FormKind) => setView(kind);
  const handleBack = () => setView("home");

  return (
    <div className={styles.shell}>
      <DemoBanner />
      <div className={styles.topBar}>
        <SettingsPanel />
      </div>
      <main className={styles.main}>
        {activeForm ? (
          <FormShell form={activeForm} onBack={handleBack} />
        ) : (
          <HomeScreen onSelectForm={handleSelectForm} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
