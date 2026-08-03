import { FileText, HeartPulse, ClipboardList, PlaneTakeoff, LifeBuoy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FORM_DEFINITIONS } from "../config/forms";
import type { FormKind } from "../types";
import { useTranslation } from "../i18n/useTranslation";
import { FormButton } from "./FormButton";
import styles from "./HomeScreen.module.css";

const ICONS: Record<FormKind, LucideIcon> = {
  meldingsblanket: FileText,
  "nine-liner": HeartPulse,
  mist: ClipboardList,
  dronemelding: PlaneTakeoff,
  "sar-melding": LifeBuoy,
};

interface HomeScreenProps {
  onSelectForm: (kind: FormKind) => void;
}

export function HomeScreen({ onSelectForm }: HomeScreenProps) {
  const { t } = useTranslation();

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
        {FORM_DEFINITIONS.map((form) => (
          <FormButton
            key={form.kind}
            titleId={form.titleId}
            Icon={ICONS[form.kind]}
            onSelect={() => onSelectForm(form.kind)}
          />
        ))}
      </section>
    </div>
  );
}
