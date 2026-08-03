import { ArrowLeft } from "lucide-react";
import { useTranslation } from "../i18n";
import styles from "./BackButton.module.css";

export function BackButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      <ArrowLeft aria-hidden="true" size={22} />
      <span>{t("nav.back")}</span>
    </button>
  );
}
