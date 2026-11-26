import {
  FormBuilderFieldSchema,
  FormBuilderLabelTranslation,
  FormFieldType,
  MentorshipForm,
  MentorshipFormField,
  MentorshipRole,
  FormFieldOption,
} from '@/types/mentorship';

export const DEFAULT_FORM_LANGUAGE = 'en';
export const FORM_RESPONSE_LANGUAGE_FIELD = '__form_language';

const TYPE_MAP: Record<string, FormFieldType> = {
  text: 'text',
  textarea: 'textarea',
  paragraph: 'textarea',
  select: 'select',
  'radio-group': 'select',
  'checkbox-group': 'multiselect',
  checkbox_group: 'multiselect',
  checkboxGroup: 'multiselect',
  number: 'number',
  email: 'email',
  tel: 'tel',
  date: 'date',
  time: 'time',
  datetime: 'datetime',
  hidden: 'text',
};

function mapFormBuilderType(fbType: string): FormFieldType {
  if (!fbType || typeof fbType !== 'string') return 'text';
  const normalized = String(fbType).trim().toLowerCase().replace(/\s+/g, '-');
  return TYPE_MAP[normalized] ?? TYPE_MAP[fbType] ?? 'text';
}

function valuesToOptions(values: FormBuilderFieldSchema['values']): FormFieldOption[] | undefined {
  if (!values || !Array.isArray(values)) return undefined;
  const seen = new Set<string>();
  return values.map((v, idx) => {
    const label =
      typeof v === 'object' && v !== null && 'label' in v
        ? String((v as { label: string }).label)
        : String(v);
    let value: string | number =
      typeof v === 'object' && v !== null && 'value' in v
        ? (v as { value: string }).value
        : label || `opt-${idx}`;
    const valueStr = String(value);
    if (seen.has(valueStr)) {
      value = `${valueStr}-${idx}`;
    }
    seen.add(valueStr);
    return { label, value };
  });
}

function getTranslation(
  translations: FormBuilderLabelTranslation[] | undefined,
  language: string
): string | undefined {
  return translations?.find(translation => translation.lang === language)?.value;
}

export function getFormBuilderLanguages(json: FormBuilderFieldSchema[]): string[] {
  const languages = new Set<string>([DEFAULT_FORM_LANGUAGE]);
  if (!Array.isArray(json)) return Array.from(languages);

  json.forEach(field => {
    field['label-translations']?.forEach(translation => {
      if (translation.lang) languages.add(translation.lang);
    });
    field.values?.forEach(option => {
      option['label-translations']?.forEach(translation => {
        if (translation.lang) languages.add(translation.lang);
      });
    });
  });

  return Array.from(languages);
}

export function formBuilderSchemaForLanguage(
  json: FormBuilderFieldSchema[],
  language: string
): FormBuilderFieldSchema[] {
  if (!Array.isArray(json)) return [];

  return json.map(field => {
    const localizedField = { ...field };
    delete localizedField['label-translations'];
    localizedField.label = getTranslation(field['label-translations'], language) ?? field.label;
    if (field.values) {
      localizedField.values = field.values.map(option => {
        const localizedOption = { ...option };
        delete localizedOption['label-translations'];
        localizedOption.label =
          getTranslation(option['label-translations'], language) ?? option.label;
        return localizedOption;
      });
    }
    return localizedField;
  });
}

/**
 * Converts jQuery formBuilder JSON schema to MentorshipForm for use with DynamicForm.
 */
export function formBuilderJsonToMentorshipForm(
  json: FormBuilderFieldSchema[],
  role: MentorshipRole
): MentorshipForm {
  if (!Array.isArray(json)) {
    return { role, fields: [] };
  }

  const fields: MentorshipFormField[] = json
    .filter(f => f.type !== 'button' && f.type !== 'header')
    .map((f, index) => {
      const id = (f.name && String(f.name).trim()) || `field_${index}`;
      const type = mapFormBuilderType(f.type || 'text');
      const options = valuesToOptions(f.values);
      return {
        id,
        label: (f.label as string) || id,
        type,
        // Respect required flag coming from formBuilder; default to true if undefined
        required: (f as { required?: boolean }).required !== false,
        placeholder: (f.placeholder as string) || undefined,
        options: options?.length ? options : undefined,
        hint: (f.description as string) || (f.hint as string) || undefined,
      } as MentorshipFormField;
    });

  return { role, fields };
}
