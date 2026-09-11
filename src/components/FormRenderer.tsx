import { useTranslation } from "../i18n/useTranslation";
import { useOptionLabel } from "../optionOverrides/useOptionLabel";
import { nowAsLocalDateTimeInputValue } from "../utils/time";
import type { FieldDefinition, FieldSection, FormValues } from "../types";
import { FieldWrapper } from "./fields/FieldWrapper";
import { fieldStyles as styles } from "./fields/fieldSharedStyles";
import { GpsField } from "./fields/GpsField";
import { MgrsField } from "./fields/MgrsField";
import { MediaCapture } from "./fields/MediaCapture";
import sectionStyles from "./FormRenderer.module.css";

interface FormRendererProps {
  sections: FieldSection[];
  values: FormValues;
  onChange: (fieldId: string, value: unknown) => void;
  mediaIds: string[];
  onMediaChange: (ids: string[]) => void;
  /** Naar sat, udelades "media"-felter her - de vises i stedet oevre i FormPage (medie-foerst-flow). */
  hideMedia?: boolean;
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
    const sourceFieldId = `${field.id}Source`;
    return (
      <GpsField
        id={field.id}
        labelId={field.labelId}
        helpId={field.helpId}
        value={typeof raw === "string" ? raw : ""}
        source={values[sourceFieldId] === "manual" ? "manual" : values[sourceFieldId] === "auto" ? "auto" : null}
        onChange={(v, source) => {
          onChange(field.id, v);
          onChange(sourceFieldId, source);
        }}
      />
    );
  }

  if (field.type === "mgrs") {
    const sourceFieldId = `${field.id}Source`;
    const gpsValue = typeof values.gpsPosition === "string" ? values.gpsPosition : "";
    return (
      <MgrsField
        id={field.id}
        labelId={field.labelId}
        helpId={field.helpId}
        gpsValue={gpsValue}
        value={typeof raw === "string" ? raw : ""}
        source={values[sourceFieldId] === "manual" ? "manual" : values[sourceFieldId] === "auto" ? "auto" : null}
        onChange={(v, source) => {
          onChange(field.id, v);
          onChange(sourceFieldId, source);
        }}
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
    const sourceFieldId = `${field.id}Source`;
    const isManual = values[sourceFieldId] === "manual";
    return (
      <FieldWrapper labelId={field.labelId} helpId={field.helpId} required={field.required} htmlFor={field.id}>
        <div className={styles.row}>
          <input
            id={field.id}
            className={styles.input}
            style={{ flex: 1, minWidth: 180 }}
            type="datetime-local"
            value={typeof raw === "string" ? raw : ""}
            onChange={(e) => {
              onChange(field.id, e.target.value);
              onChange(sourceFieldId, "manual");
            }}
          />
          <button
            type="button"
            className={styles.smallButton}
            onClick={() => {
              onChange(field.id, nowAsLocalDateTimeInputValue());
              onChange(sourceFieldId, "auto");
            }}
          >
            {t("fields.datetime.now")}
          </button>
        </div>
        {isManual && <p style={{ fontSize: "0.75rem", opacity: 0.7, margin: 0 }}>{t("fields.datetime.manuallyEdited")}</p>}
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
export function FormRenderer({ sections, values, onChange, mediaIds, onMediaChange, hideMedia }: FormRendererProps) {
  const { t } = useTranslation();

  return (
    <>
      {sections.map((section) => {
        const visibleFields = section.fields
          .filter((f) => !f.showWhen || f.showWhen(values))
          .filter((f) => !(hideMedia && f.type === "media"));
        if (visibleFields.length === 0) return null;

        return (
          <details key={section.id} className={sectionStyles.section} open={!section.defaultCollapsed}>
            <summary className={sectionStyles.sectionTitle}>{t(section.titleId)}</summary>
            <div className={sectionStyles.sectionBody}>
              {visibleFields.map((field) =>
                field.type === "media" ? (
                  <MediaCapture key={field.id} ids={mediaIds} onChange={onMediaChange} />
                ) : (
                  <FieldInput key={field.id} field={field} values={values} onChange={onChange} />
                ),
              )}
            </div>
          </details>
        );
      })}
    </>
  );
}
