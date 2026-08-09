import { useTranslation } from "../i18n/useTranslation";
import { useOptionLabel } from "../optionOverrides/useOptionLabel";
import type { FieldDefinition, FieldSection, FormValues } from "../types";
import { FieldWrapper } from "./fields/FieldWrapper";
import { fieldStyles as styles } from "./fields/fieldSharedStyles";
import { GpsField } from "./fields/GpsField";
import { MediaCapture } from "./fields/MediaCapture";
import sectionStyles from "./FormRenderer.module.css";

interface FormRendererProps {
  sections: FieldSection[];
  values: FormValues;
  onChange: (fieldId: string, value: unknown) => void;
  mediaIds: string[];
  onMediaChange: (ids: string[]) => void;
}

function FieldInput({
  field,
  values,
  onChange,
}: {
  field: FieldDefinition;
  values: FormValues;
  onChange: (fieldId: string, value: unknown) => void;
}) {
  const { t } = useTranslation();
  const optionLabel = useOptionLabel();
  const raw = values[field.id];

  if (field.type === "media") {
    return null; // haandteret separat via MediaCapture i FormRenderer
  }

  if (field.type === "gps") {
    return (
      <GpsField
        id={field.id}
        labelId={field.labelId}
        helpId={field.helpId}
        value={typeof raw === "string" ? raw : ""}
        onChange={(v) => onChange(field.id, v)}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <FieldWrapper labelId={field.labelId} helpId={field.helpId} required={field.required} htmlFor={field.id}>
        <textarea
          id={field.id}
          className={styles.input}
          value={typeof raw === "string" ? raw : ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      </FieldWrapper>
    );
  }

  if (field.type === "datetime") {
    return (
      <FieldWrapper labelId={field.labelId} helpId={field.helpId} required={field.required} htmlFor={field.id}>
        <div className={styles.row}>
          <input
            id={field.id}
            className={styles.input}
            style={{ flex: 1, minWidth: 180 }}
            type="datetime-local"
            value={typeof raw === "string" ? raw : ""}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
          <button
            type="button"
            className={styles.smallButton}
            onClick={() => {
              const now = new Date();
              now.setSeconds(0, 0);
              onChange(field.id, now.toISOString().slice(0, 16));
            }}
          >
            {t("fields.datetime.now")}
          </button>
        </div>
      </FieldWrapper>
    );
  }

  if (field.type === "radio" && field.options) {
    return (
      <FieldWrapper labelId={field.labelId} helpId={field.helpId} required={field.required}>
        <div className={styles.radioGroup} role="radiogroup">
          {field.options.map((opt) => (
            <label key={opt.value} className={styles.radioOption}>
              <input
                type="radio"
                name={field.id}
                checked={raw === opt.value}
                onChange={() => onChange(field.id, opt.value)}
              />
              {optionLabel(opt.labelId)}
            </label>
          ))}
        </div>
      </FieldWrapper>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <FieldWrapper labelId={field.labelId} helpId={field.helpId} required={field.required} htmlFor={field.id}>
        <select
          id={field.id}
          className={styles.input}
          value={typeof raw === "string" ? raw : ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        >
          <option value="">{t("fields.select.placeholder")}</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {optionLabel(opt.labelId)}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className={styles.checkboxOption}>
        <input
          type="checkbox"
          checked={raw === true}
          onChange={(e) => onChange(field.id, e.target.checked)}
        />
        {t(field.labelId)}
      </label>
    );
  }

  // "text" default
  return (
    <FieldWrapper labelId={field.labelId} helpId={field.helpId} required={field.required} htmlFor={field.id}>
      <input
        id={field.id}
        className={styles.input}
        type="text"
        value={typeof raw === "string" ? raw : ""}
        onChange={(e) => onChange(field.id, e.target.value)}
      />
    </FieldWrapper>
  );
}

/**
 * Genererer formularfelter ud fra en konfigurationsstyret liste af
 * sektioner/felter. Mediefelter routes til den faelles MediaCapture-
 * komponent i stedet for et almindeligt inputfelt.
 */
export function FormRenderer({ sections, values, onChange, mediaIds, onMediaChange }: FormRendererProps) {
  const { t } = useTranslation();

  return (
    <>
      {sections.map((section) => (
        <div key={section.id} className={sectionStyles.section}>
          <h2 className={sectionStyles.sectionTitle}>{t(section.titleId)}</h2>
          {section.fields
            .filter((f) => !f.showWhen || f.showWhen(values))
            .map((field) =>
              field.type === "media" ? (
                <MediaCapture key={field.id} ids={mediaIds} onChange={onMediaChange} />
              ) : (
                <FieldInput key={field.id} field={field} values={values} onChange={onChange} />
              ),
            )}
        </div>
      ))}
    </>
  );
}
