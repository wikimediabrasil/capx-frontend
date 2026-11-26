import {
  formBuilderSchemaForLanguage,
  getFormBuilderLanguages,
} from '../../utils/formBuilderToMentorshipForm';
import { FormBuilderFieldSchema } from '../../types/mentorship';

describe('multilingual formBuilder schemas', () => {
  const schema: FormBuilderFieldSchema[] = [
    {
      type: 'select',
      name: 'language',
      label: 'Preferred language',
      'label-translations': [{ lang: 'pt', value: 'Idioma preferido' }],
      values: [
        {
          label: 'English',
          value: 'en',
          'label-translations': [{ lang: 'pt', value: 'Inglês' }],
        },
      ],
    },
  ];

  it('lists the default and translated field and option languages', () => {
    expect(getFormBuilderLanguages(schema)).toEqual(['en', 'pt']);
  });

  it('localizes field and option labels while removing builder metadata', () => {
    expect(formBuilderSchemaForLanguage(schema, 'pt')).toEqual([
      {
        type: 'select',
        name: 'language',
        label: 'Idioma preferido',
        values: [{ label: 'Inglês', value: 'en' }],
      },
    ]);
  });

  it('falls back to the default label for a missing translation', () => {
    expect(formBuilderSchemaForLanguage(schema, 'fr')[0].label).toBe('Preferred language');
  });

  it('keeps legacy schemas available in English without adding translation metadata', () => {
    const legacySchema: FormBuilderFieldSchema[] = [{ type: 'text', name: 'name', label: 'Name' }];
    expect(getFormBuilderLanguages(legacySchema)).toEqual(['en']);
    expect(formBuilderSchemaForLanguage(legacySchema, 'en')).toEqual(legacySchema);
  });
});
