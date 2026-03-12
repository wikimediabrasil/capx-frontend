import {
  FormBuilderFieldSchema,
  FormFieldType,
  MentorshipForm,
  MentorshipFormField,
  MentorshipRole,
  FormFieldOption,
} from '@/types/mentorship';

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
        required: true,
        placeholder: (f.placeholder as string) || undefined,
        options: options?.length ? options : undefined,
        hint: (f.description as string) || (f.hint as string) || undefined,
      } as MentorshipFormField;
    });

  return { role, fields };
}
