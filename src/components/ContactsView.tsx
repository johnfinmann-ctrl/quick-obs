import { useTranslation } from "../i18n/useTranslation";
import { BackButton } from "./BackButton";
import { ContactsList } from "./ContactsList";

export function ContactsView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: "var(--qo-max-content-width)", margin: "0 auto", padding: "16px 16px 48px", display: "flex", flexDirection: "column", gap: 16 }}>
      <BackButton onClick={onBack} />
      <h1 style={{ color: "var(--qo-color-heading)", margin: 0 }}>{t("contacts.title")}</h1>
      <ContactsList />
    </div>
  );
}
