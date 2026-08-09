import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { listContacts } from "../storage/contacts";
import type { ContactDomain, EmergencyContact } from "../types";
import styles from "./ContactsList.module.css";

interface ContactsListProps {
  domainFilter?: ContactDomain;
}

/**
 * Centralt, administrerbart kontaktmodul. Kontaktdata hentes fra
 * IndexedDB (via storage/contacts.ts) - ALDRIG hardkodet i denne eller
 * andre formular-komponenter. Et tryk paa RING NU kraever bekraeftelse,
 * foer telefonens opkaldsdialog aabnes via et almindeligt tel:-link.
 */
export function ContactsList({ domainFilter }: ContactsListProps) {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [pending, setPending] = useState<EmergencyContact | null>(null);

  useEffect(() => {
    listContacts().then(setContacts);
  }, []);

  const visible = contacts
    .filter((c) => c.active)
    .filter((c) => !domainFilter || c.domain === domainFilter || c.domain === "generel");

  return (
    <div className={styles.list}>
      {visible.length === 0 && <p>{t("contacts.empty")}</p>}
      {visible.map((contact) => (
        <div key={contact.id} className={styles.card}>
          <p className={styles.name}>{contact.name}</p>
          <p className={styles.meta}>
            {contact.authority} · {t(`contacts.region.${contact.region}`)} ·{" "}
            {t(`contacts.domain.${contact.domain}`)}
          </p>
          <p className={styles.meta}>
            {t("contacts.lastVerified")}: {contact.lastVerified} ({contact.source})
          </p>
          <button type="button" className={styles.callButton} onClick={() => setPending(contact)}>
            {t("contacts.callNow")} {contact.phone}
          </button>
        </div>
      ))}

      {pending && (
        <div className={styles.confirmOverlay} role="alertdialog" aria-modal="true">
          <div className={styles.confirmBox}>
            <p>
              {t("contacts.confirmCall")} <strong>{pending.name}</strong> ({pending.phone})?
            </p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.callButton} style={{ background: "transparent", border: "2px solid var(--qo-color-heading)", color: "var(--qo-color-heading)" }} onClick={() => setPending(null)}>
                {t("contacts.cancel")}
              </button>
              <a
                href={`tel:${pending.phone.replace(/\s+/g, "")}`}
                className={styles.callButton}
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                onClick={() => setPending(null)}
              >
                {t("contacts.callNow")}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
