import {
  Zap,
  FileText,
  FileBarChart,
  HeartPulse,
  Stethoscope,
  PlaneTakeoff,
  LifeBuoy,
  Library,
  History,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FormKind } from "../types";
import { useTranslation } from "../i18n/useTranslation";
import { useFormLibrary } from "../formLibrary/useFormLibrary";
import { FormButton } from "./FormButton";
import { MODULE_COLORS } from "../config/moduleColors";
import styles from "./HomeScreen.module.css";

const ICONS: Record<FormKind, LucideIcon> = {
  "hurtig-rapport": Zap,
  meldingsblanket: FileText,
  sitrep: FileBarChart,
  "nine-liner": HeartPulse,
  mist: Stethoscope,
  dronemelding: PlaneTakeoff,
  "sar-melding": LifeBuoy,
};

interface HomeScreenProps {
  onSelectForm: (kind: FormKind) => void;
  onOpenFormLibrary: () => void;
  onOpenHistory: () => void;
}

/**
 * Forside. Rekkefoelgen og hvilke blanketter der vises styres af
 * Blanketbiblioteket (aktiv/inaktiv + sortering, redigerbart i
 * Administration) - ikke hardkodet her. "Hurtig rapport" vises altid
 * foerst og i fuld bredde, da den er tiltaenkt som det hurtigste
 * indgangspunkt. 9-Liner og MIST grupperes under en "Medicinsk"-label.
 */
export function HomeScreen({ onSelectForm, onOpenFormLibrary, onOpenHistory }: HomeScreenProps) {
  const { t } = useTranslation();
  const { activeDefinitions } = useFormLibrary();

  const quick = activeDefinitions.find((d) => d.kind === "hurtig-rapport");
  const rest = activeDefinitions.filter((d) => d.kind !== "hurtig-rapport");
  const medicalKinds = new Set<FormKind>(["nine-liner", "mist"]);
  const medical = rest.filter((d) => medicalKinds.has(d.kind));
  const other = rest.filter((d) => !medicalKinds.has(d.kind));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("app.name")}</h1>
        <p className={styles.subtitle}>{t("app.subtitle")}</p>
      </header>

      <section aria-labelledby="home-forms-heading" className={styles.formList}>
        <h2 id="home-forms-heading" className="qo-visually-hidden">
          {t("home.formsHeading")}
        </h2>

        {quick && (
          <div className={styles.fullWidth}>
            <FormButton titleId={quick.titleId} Icon={ICONS[quick.kind]} color={quick.moduleColor} highlighted={quick.highlighted} onSelect={() => onSelectForm(quick.kind)} />
          </div>
        )}

        {other.map((form) => (
          <FormButton key={form.kind} titleId={form.titleId} Icon={ICONS[form.kind]} color={form.moduleColor} highlighted={form.highlighted} onSelect={() => onSelectForm(form.kind)} />
        ))}

        {medical.length > 0 && (
          <p className={styles.sectionLabel} style={{ gridColumn: "1 / -1" }}>
            {t("home.medicalSection")}
          </p>
        )}
        {medical.map((form) => (
          <FormButton key={form.kind} titleId={form.titleId} Icon={ICONS[form.kind]} color={form.moduleColor} highlighted={form.highlighted} onSelect={() => onSelectForm(form.kind)} />
        ))}

        <p className={styles.sectionLabel} style={{ gridColumn: "1 / -1" }}>
          {t("home.moreSection")}
        </p>
        <FormButton titleId="formLibrary.title" Icon={Library} color={MODULE_COLORS.formLibrary} onSelect={onOpenFormLibrary} />
        <FormButton titleId="nav.history" Icon={History} color={MODULE_COLORS.history} onSelect={onOpenHistory} />
      </section>
    </div>
  );
}
