import { useEffect, useState } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { useAdminLock } from "../hooks/useAdminLock";
import { useOptionOverrides } from "../optionOverrides/useOptionLabel";
import { PinDialog } from "./PinDialog";
import { BackButton } from "./BackButton";
import { loadSettings, saveSettings } from "../storage/settings";
import { createPinHash, DEFAULT_DEMO_PIN } from "../storage/pin";
import { listContacts, saveContact, deleteContact } from "../storage/contacts";
import { estimateStorage } from "../storage/db";
import { exportBackup, importBackup, resetDemoData } from "../storage/backup";
import { loadDraft, clearDraft } from "../storage/drafts";
import { computeCoverage } from "../i18n/coverage";
import { downloadTranslationExport } from "../i18n/exportTranslationFile";
import { useFormLibrary } from "../formLibrary/useFormLibrary";
import { FORM_DEFINITIONS } from "../config/forms";
import {
  PRECEDENCE_OPTIONS,
  SPECIAL_EQUIPMENT_OPTIONS,
  SECURITY_OPTIONS_WARTIME,
  MARKING_OPTIONS,
  NATIONALITY_OPTIONS,
  CBRN_OPTIONS,
} from "../config/nineLinerConfig";
import type { AppSettings, Draft, EmergencyContact, FormKind } from "../types";
import styles from "./AdminPanel.module.css";

const NINE_LINER_OPTION_GROUPS = [
  { titleId: "nineLiner.codes.group.precedence", options: PRECEDENCE_OPTIONS },
  { titleId: "nineLiner.codes.group.equipment", options: SPECIAL_EQUIPMENT_OPTIONS },
  { titleId: "nineLiner.codes.group.security", options: SECURITY_OPTIONS_WARTIME },
  { titleId: "nineLiner.codes.group.marking", options: MARKING_OPTIONS },
  { titleId: "nineLiner.codes.group.nationality", options: NATIONALITY_OPTIONS },
  { titleId: "nineLiner.codes.group.cbrn", options: CBRN_OPTIONS },
];

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { unlocked, unlock, lock } = useAdminLock();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [pinReady, setPinReady] = useState(false);

  useEffect(() => {
    (async () => {
      let s = await loadSettings();
      if (!s.pinHash) {
        const { hash, salt } = await createPinHash(DEFAULT_DEMO_PIN);
        s = { ...s, pinHash: hash, pinSalt: salt };
        await saveSettings(s);
      }
      setSettings(s);
      setPinReady(true);
    })();
  }, []);

  if (!pinReady || !settings) {
    return (
      <div className={styles.container}>
        <BackButton onClick={onBack} />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className={styles.container}>
        <BackButton onClick={onBack} />
        <PinDialog pinHash={settings.pinHash!} pinSalt={settings.pinSalt!} onSuccess={unlock} onCancel={onBack} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.row} style={{ justifyContent: "space-between" }}>
        <BackButton onClick={onBack} />
        <button type="button" className={styles.button} onClick={lock}>
          {t("admin.lockNow")}
        </button>
      </div>

      <h1 className={styles.title}>{t("admin.title")}</h1>
      <p className={styles.warningNote}>{t("admin.pin.notMilitaryGrade")}</p>

      <FormLibrarySection t={t} />
      <ContactsSection t={t} />
      <NineLinerCodesSection t={t} />
      <SettingsSection settings={settings} setSettings={setSettings} t={t} />
      <MapSection settings={settings} setSettings={setSettings} t={t} />
      <StorageSection t={t} />
      <DraftsSection t={t} />
      <BackupSection t={t} />
      <TranslationStatusSection t={t} />
      <ChangePinSection t={t} settings={settings} setSettings={setSettings} />
      <ResetSection t={t} />
    </div>
  );
}

type Translate = (key: string) => string;

function ContactsSection({ t }: { t: Translate }) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    listContacts().then(setContacts);
  }, []);

  async function update(contact: EmergencyContact, patch: Partial<EmergencyContact>) {
    const next = { ...contact, ...patch };
    await saveContact(next);
    setContacts((prev) => prev.map((c) => (c.id === contact.id ? next : c)));
  }

  async function remove(id: string) {
    await deleteContact(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.contacts.title")}</h2>
      {contacts.map((c) => (
        <div key={c.id} className={styles.contactCard}>
          <input
            className={styles.input}
            value={c.name}
            onChange={(e) => update(c, { name: e.target.value })}
          />
          <div className={styles.row}>
            <input
              className={styles.input}
              value={c.phone}
              onChange={(e) => update(c, { phone: e.target.value })}
              style={{ flex: 1, minWidth: 140 }}
            />
            <label className={styles.row}>
              <input type="checkbox" checked={c.active} onChange={(e) => update(c, { active: e.target.checked })} />
              {t("admin.contacts.active")}
            </label>
          </div>
          <p className={styles.small}>
            {t("admin.contacts.lastVerified")}: {c.lastVerified} - {c.source}
          </p>
          <button type="button" className={styles.dangerButton} onClick={() => remove(c.id)}>
            {t("admin.contacts.delete")}
          </button>
        </div>
      ))}
    </section>
  );
}

function NineLinerCodesSection({ t }: { t: Translate }) {
  const { overrides, setOverride } = useOptionOverrides();

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.nineLinerCodes.title")}</h2>
      <p className={styles.small}>{t("admin.nineLinerCodes.help")}</p>
      {NINE_LINER_OPTION_GROUPS.map((group) => (
        <div key={group.titleId}>
          <p style={{ fontWeight: 700, margin: "8px 0 4px" }}>{t(group.titleId)}</p>
          {group.options.map((opt) => (
            <div key={opt.labelId} className={styles.row}>
              <span style={{ minWidth: 32, fontFamily: "monospace" }}>{opt.value}</span>
              <input
                className={styles.input}
                style={{ flex: 1, minWidth: 160 }}
                value={overrides[opt.labelId] ?? t(opt.labelId)}
                onChange={(e) => setOverride(opt.labelId, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

function SettingsSection({
  settings,
  setSettings,
  t,
}: {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  t: Translate;
}) {
  async function update(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch };
    await saveSettings(next);
    setSettings(next);
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.settings.title")}</h2>
      <label>
        {t("admin.settings.callsign")}
        <input
          className={styles.input}
          style={{ display: "block", marginTop: 4, width: "100%" }}
          value={settings.callsign}
          onChange={(e) => update({ callsign: e.target.value })}
        />
      </label>
      <label>
        {t("admin.settings.region")}
        <select
          className={styles.input}
          style={{ display: "block", marginTop: 4, width: "100%" }}
          value={settings.region}
          onChange={(e) => update({ region: e.target.value as AppSettings["region"] })}
        >
          <option value="auto">{t("admin.settings.regionAuto")}</option>
          <option value="groenland">{t("contacts.region.groenland")}</option>
          <option value="faeroeerne">{t("contacts.region.faeroeerne")}</option>
          <option value="danmark">{t("contacts.region.danmark")}</option>
        </select>
      </label>
      <label>
        {t("admin.settings.autoDelete")}
        <select
          className={styles.input}
          style={{ display: "block", marginTop: 4, width: "100%" }}
          value={settings.autoDeleteHours}
          onChange={(e) => update({ autoDeleteHours: Number(e.target.value) as AppSettings["autoDeleteHours"] })}
        >
          <option value={0}>{t("admin.settings.autoDeleteNever")}</option>
          <option value={24}>24 {t("admin.settings.autoDeleteHoursLabel")}</option>
          <option value={48}>48 {t("admin.settings.autoDeleteHoursLabel")}</option>
          <option value={72}>72 {t("admin.settings.autoDeleteHoursLabel")}</option>
        </select>
      </label>
    </section>
  );
}

function StorageSection({ t }: { t: Translate }) {
  const [estimate, setEstimate] = useState<{ usage: number; quota: number } | null>(null);

  useEffect(() => {
    estimateStorage().then(setEstimate);
  }, []);

  const percent = estimate && estimate.quota > 0 ? Math.min(100, Math.round((estimate.usage / estimate.quota) * 100)) : 0;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.storage.title")}</h2>
      {estimate ? (
        <>
          <p className={styles.small}>
            {(estimate.usage / 1024 / 1024).toFixed(1)} MB / {(estimate.quota / 1024 / 1024).toFixed(0)} MB ({percent}%)
          </p>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${percent}%` }} />
          </div>
        </>
      ) : (
        <p className={styles.small}>{t("admin.storage.unavailable")}</p>
      )}
    </section>
  );
}

const DRAFT_KINDS: FormKind[] = FORM_DEFINITIONS.map((f) => f.kind);

function DraftsSection({ t }: { t: Translate }) {
  const [drafts, setDrafts] = useState<Record<string, Draft | undefined>>({});

  async function refresh() {
    const entries = await Promise.all(DRAFT_KINDS.map(async (k) => [k, await loadDraft(k)] as const));
    setDrafts(Object.fromEntries(entries));
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.drafts.title")}</h2>
      {DRAFT_KINDS.map((kind) => {
        const draft = drafts[kind];
        return (
          <div key={kind} className={styles.row} style={{ justifyContent: "space-between" }}>
            <span>{kind}</span>
            {draft ? (
              <div className={styles.row}>
                <span className={styles.small}>{new Date(draft.updatedAt).toLocaleString("da-DK")}</span>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={async () => {
                    await clearDraft(kind);
                    refresh();
                  }}
                >
                  {t("admin.drafts.delete")}
                </button>
              </div>
            ) : (
              <span className={styles.small}>{t("admin.drafts.none")}</span>
            )}
          </div>
        );
      })}
    </section>
  );
}

function BackupSection({ t }: { t: Translate }) {
  const [status, setStatus] = useState<string | null>(null);

  async function handleExport() {
    const payload = await exportBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quick-obs-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(t("admin.backup.exported"));
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!confirm(t("admin.backup.confirmImport"))) return;
      await importBackup(payload);
      setStatus(t("admin.backup.imported"));
    } catch {
      setStatus(t("admin.backup.importFailed"));
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.backup.title")}</h2>
      <p className={styles.small}>{t("admin.backup.note")}</p>
      <div className={styles.row}>
        <button type="button" className={styles.button} onClick={handleExport}>
          {t("admin.backup.export")}
        </button>
        <label className={styles.button} style={{ display: "inline-block" }}>
          {t("admin.backup.import")}
          <input type="file" accept="application/json" style={{ display: "none" }} onChange={handleImport} />
        </label>
      </div>
      {status && <p className={styles.small}>{status}</p>}
    </section>
  );
}

function TranslationStatusSection({ t }: { t: Translate }) {
  const kl = computeCoverage("kl");
  const fo = computeCoverage("fo");

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.translations.title")}</h2>
      <p className={styles.warningNote}>{t("admin.translations.draftWarning")}</p>

      <div className={styles.row} style={{ justifyContent: "space-between" }}>
        <strong>{t("admin.translations.da")}</strong>
        <span className={styles.small}>{t("admin.translations.daStatus")}</span>
      </div>
      <div>
        <div className={styles.row} style={{ justifyContent: "space-between" }}>
          <strong>{t("admin.translations.fo")}</strong>
          <span className={styles.small}>{t("admin.translations.foStatus")}</span>
        </div>
        <p className={styles.small}>
          {fo.translated}/{fo.total} ({fo.percent}%)
        </p>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${fo.percent}%` }} />
        </div>
      </div>
      <div>
        <div className={styles.row} style={{ justifyContent: "space-between" }}>
          <strong>{t("admin.translations.kl")}</strong>
          <span className={styles.small}>{t("admin.translations.klStatus")}</span>
        </div>
        <p className={styles.small}>
          {kl.translated}/{kl.total} ({kl.percent}%)
        </p>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${kl.percent}%` }} />
        </div>
      </div>

      <button type="button" className={styles.button} onClick={downloadTranslationExport}>
        {t("admin.translations.exportSource")}
      </button>
      <p className={styles.small}>{t("admin.translations.exportSourceHelp")}</p>
    </section>
  );
}

function FormLibrarySection({ t }: { t: Translate }) {
  const { definitions, setOverride } = useFormLibrary();

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("formLibrary.title")}</h2>
      <p className={styles.small}>{t("admin.formLibrary.help")}</p>
      {definitions.map((def) => (
        <div key={def.kind} className={styles.contactCard}>
          <div className={styles.row} style={{ justifyContent: "space-between" }}>
            <strong>{t(def.titleId)}</strong>
            <label className={styles.row}>
              <input
                type="checkbox"
                checked={def.active}
                onChange={(e) => setOverride(def.kind, { active: e.target.checked, sortOrder: def.sortOrder })}
              />
              {t("admin.contacts.active")}
            </label>
          </div>
          <div className={styles.row}>
            <label className={styles.small}>{t("formLibrary.sortOrder")}</label>
            <input
              type="number"
              className={styles.input}
              style={{ width: 80 }}
              value={def.sortOrder}
              onChange={(e) => setOverride(def.kind, { active: def.active, sortOrder: Number(e.target.value) })}
            />
          </div>
          <p className={styles.small}>
            v{def.version} · {t(`formLibrary.status.${def.status}`)} · {def.lastReview}
          </p>
        </div>
      ))}
    </section>
  );
}

function MapSection({
  settings,
  setSettings,
  t,
}: {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  t: Translate;
}) {
  async function toggle(enabled: boolean) {
    const next = { ...settings, mapEnabled: enabled };
    await saveSettings(next);
    setSettings(next);
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.map.title")}</h2>
      <p className={styles.small}>{t("admin.map.help")}</p>
      <label className={styles.row}>
        <input type="checkbox" checked={settings.mapEnabled} onChange={(e) => toggle(e.target.checked)} />
        {t("admin.map.enabled")}
      </label>
    </section>
  );
}

function ChangePinSection({
  settings,
  setSettings,
  t,
}: {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  t: Translate;
}) {
  const [newPin, setNewPin] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleChange() {
    if (newPin.length < 4) {
      setStatus(t("admin.pin.tooShort"));
      return;
    }
    const { hash, salt } = await createPinHash(newPin);
    const next = { ...settings, pinHash: hash, pinSalt: salt };
    await saveSettings(next);
    setSettings(next);
    setNewPin("");
    setStatus(t("admin.pin.changed"));
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.pin.changeTitle")}</h2>
      <div className={styles.row}>
        <input
          className={styles.input}
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
          placeholder={t("admin.pin.newPinPlaceholder")}
        />
        <button type="button" className={styles.button} onClick={handleChange}>
          {t("admin.pin.save")}
        </button>
      </div>
      {status && <p className={styles.small}>{status}</p>}
    </section>
  );
}

function ResetSection({ t }: { t: Translate }) {
  const [status, setStatus] = useState<string | null>(null);

  async function handleReset() {
    if (!confirm(t("admin.reset.confirm1"))) return;
    if (!confirm(t("admin.reset.confirm2"))) return;
    await resetDemoData();
    setStatus(t("admin.reset.done"));
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.reset.title")}</h2>
      <p className={styles.small}>{t("admin.reset.help")}</p>
      <button type="button" className={styles.dangerButton} onClick={handleReset}>
        {t("admin.reset.action")}
      </button>
      {status && <p className={styles.small}>{status}</p>}
    </section>
  );
}
