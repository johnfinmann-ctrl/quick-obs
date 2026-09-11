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
import { computeCoverage, getMissingKeys } from "../i18n/coverage";
import { downloadTranslationExport } from "../i18n/exportTranslationFile";
import { validateTranslationImport, saveTranslationOverrides } from "../storage/translationOverrides";
import { useFormLibrary } from "../formLibrary/useFormLibrary";
import { FORM_DEFINITIONS } from "../config/forms";
import { MODULE_COLOR_PALETTE } from "../config/modulePalette";
import {
  detectDeviceTimeZone,
  isValidIanaTimeZone,
  getUtcOffsetMinutes,
  formatLocalDateTime,
  formatDtgZulu,
  formatUtcOffsetLabel,
  localDateTimeStringToUtcDate,
  nowAsLocalDateTimeInputValue,
} from "../utils/time";
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

      <FormLibrarySection t={t} settings={settings} setSettings={setSettings} />
      <ContactsSection t={t} />
      <NineLinerCodesSection t={t} />
      <SettingsSection settings={settings} setSettings={setSettings} t={t} />
      <MapSection settings={settings} setSettings={setSettings} t={t} />
      <TimeZoneSection settings={settings} setSettings={setSettings} t={t} />
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
  const { refreshOverrides } = useTranslation();
  const kl = computeCoverage("kl");
  const fo = computeCoverage("fo");
  const [showMissing, setShowMissing] = useState<"kl" | "fo" | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  async function handleImport(lang: "kl" | "fo", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const result = validateTranslationImport(payload, lang);
      if (!result.ok) {
        setImportStatus(`${lang.toUpperCase()}: ${result.error}`);
        return;
      }
      await saveTranslationOverrides(lang, result.values);
      refreshOverrides();
      setImportStatus(t("admin.translations.importSuccess").replace("{n}", String(Object.keys(result.values).length)));
    } catch {
      setImportStatus(t("admin.translations.importFailed"));
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.translations.title")}</h2>
      <p className={styles.warningNote}>{t("admin.translations.draftWarning")}</p>

      <div className={styles.row} style={{ justifyContent: "space-between" }}>
        <strong>{t("admin.translations.da")}</strong>
        <span className={styles.small}>{t("admin.translations.daStatus")}</span>
      </div>

      {[
        { code: "fo" as const, stats: fo, label: t("admin.translations.fo"), status: t("admin.translations.foStatus") },
        { code: "kl" as const, stats: kl, label: t("admin.translations.kl"), status: t("admin.translations.klStatus") },
      ].map(({ code, stats, label, status }) => (
        <div key={code}>
          <div className={styles.row} style={{ justifyContent: "space-between" }}>
            <strong>{label}</strong>
            <span className={styles.small}>{status}</span>
          </div>
          <p className={styles.small}>
            {t("admin.translations.total")}: {stats.total} · {t("admin.translations.translated")}: {stats.translated} ·{" "}
            {t("admin.translations.missing")}: {stats.total - stats.translated} ({stats.percent}%)
          </p>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${stats.percent}%` }} />
          </div>
          <div className={styles.row}>
            <button type="button" className={styles.button} onClick={() => setShowMissing(showMissing === code ? null : code)}>
              {t("admin.translations.showMissing")}
            </button>
            <label className={styles.button} style={{ display: "inline-block" }}>
              {t("admin.translations.importFile")}
              <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => handleImport(code, e)} />
            </label>
          </div>
          {showMissing === code && (
            <ul style={{ maxHeight: 160, overflowY: "auto", fontSize: "0.8rem", opacity: 0.8 }}>
              {getMissingKeys(code).map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {importStatus && <p className={styles.small}>{importStatus}</p>}

      <button type="button" className={styles.button} onClick={downloadTranslationExport}>
        {t("admin.translations.exportSource")}
      </button>
      <p className={styles.small}>{t("admin.translations.exportSourceHelp")}</p>
      <p className={styles.small}>{t("admin.translations.importValidationNote")}</p>
    </section>
  );
}

function FormLibrarySection({
  t,
  settings,
  setSettings,
}: {
  t: Translate;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}) {
  const { definitions, setOverride, resetToDefaults } = useFormLibrary();

  async function updateStartModule(value: string) {
    const next = { ...settings, startModule: value };
    await saveSettings(next);
    setSettings(next);
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("formLibrary.title")}</h2>
      <p className={styles.small}>{t("admin.formLibrary.help")}</p>

      <label>
        {t("admin.formLibrary.startModule")}
        <select
          className={styles.input}
          style={{ display: "block", marginTop: 4, width: "100%" }}
          value={settings.startModule}
          onChange={(e) => updateStartModule(e.target.value)}
        >
          <option value="home">{t("admin.formLibrary.startModuleHome")}</option>
          {definitions.map((def) => (
            <option key={def.kind} value={def.kind}>
              {t(def.titleId)}
            </option>
          ))}
        </select>
      </label>

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
            <label className={styles.row}>
              <input
                type="checkbox"
                checked={def.highlighted ?? false}
                onChange={(e) => setOverride(def.kind, { active: def.active, sortOrder: def.sortOrder, highlighted: e.target.checked })}
              />
              {t("admin.formLibrary.highlight")}
            </label>
          </div>
          <div className={styles.row}>
            <label className={styles.small}>{t("admin.formLibrary.moduleColor")}</label>
            {MODULE_COLOR_PALETTE.map((c) => (
              <button
                key={c.value}
                type="button"
                title={t(c.labelId)}
                onClick={() => setOverride(def.kind, { active: def.active, sortOrder: def.sortOrder, color: c.value })}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: c.value,
                  border: def.moduleColor === c.value ? "3px solid var(--qo-color-heading)" : "1px solid var(--qo-color-border)",
                  cursor: "pointer",
                }}
                aria-label={t(c.labelId)}
              />
            ))}
          </div>
          <p className={styles.small}>
            v{def.version} · {t(`formLibrary.status.${def.status}`)} · {def.lastReview}
          </p>
        </div>
      ))}

      <button type="button" className={styles.dangerButton} onClick={resetToDefaults}>
        {t("admin.formLibrary.restoreDefaults")}
      </button>
    </section>
  );
}

function TimeZoneSection({
  t,
  settings,
  setSettings,
}: {
  t: Translate;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}) {
  const [manualInput, setManualInput] = useState(settings.manualTimeZone ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [testDate, setTestDate] = useState(() => nowAsLocalDateTimeInputValue());

  const effectiveTz = settings.timeZoneMode === "manual" && settings.manualTimeZone ? settings.manualTimeZone : detectDeviceTimeZone();

  async function useAutomatic() {
    const next = { ...settings, timeZoneMode: "auto" as const, manualTimeZone: null };
    await saveSettings(next);
    setSettings(next);
    setValidationError(null);
  }

  async function useManual() {
    if (!isValidIanaTimeZone(manualInput)) {
      setValidationError(t("admin.timezone.invalid"));
      return;
    }
    setValidationError(null);
    const next = { ...settings, timeZoneMode: "manual" as const, manualTimeZone: manualInput };
    await saveSettings(next);
    setSettings(next);
  }

  const testUtc = localDateTimeStringToUtcDate(testDate, effectiveTz);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("admin.timezone.title")}</h2>
      <p className={styles.small}>
        {t("admin.timezone.current")}: <strong>{effectiveTz}</strong> ({settings.timeZoneMode === "manual" ? t("admin.timezone.manual") : t("admin.timezone.auto")})
      </p>
      {testUtc && (
        <>
          <p className={styles.small}>
            {t("admin.timezone.utcOffset")}: {formatUtcOffsetLabel(getUtcOffsetMinutes(testUtc, effectiveTz))}
          </p>
          <p className={styles.small}>
            {t("admin.timezone.localExample")}: {formatLocalDateTime(testUtc, effectiveTz)}
          </p>
          <p className={styles.small}>DTG: {formatDtgZulu(testUtc)}</p>
        </>
      )}

      <div className={styles.row}>
        <button type="button" className={styles.button} onClick={useAutomatic}>
          {t("admin.timezone.useAuto")}
        </button>
      </div>
      <div className={styles.row}>
        <input
          className={styles.input}
          style={{ flex: 1, minWidth: 160 }}
          value={manualInput}
          placeholder="fx America/Nuuk"
          onChange={(e) => setManualInput(e.target.value)}
        />
        <button type="button" className={styles.button} onClick={useManual}>
          {t("admin.timezone.useManual")}
        </button>
      </div>
      {validationError && <p style={{ color: "var(--qo-color-mayday)" }}>{validationError}</p>}

      <label>
        {t("admin.timezone.testDate")}
        <input
          type="datetime-local"
          className={styles.input}
          style={{ display: "block", marginTop: 4, width: "100%" }}
          value={testDate}
          onChange={(e) => setTestDate(e.target.value)}
        />
      </label>
      <p className={styles.small}>{t("admin.timezone.testHelp")}</p>
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
