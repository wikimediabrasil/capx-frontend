import { getOrganizationDisplayName } from '@/lib/utils/getOrganizationDisplayName';
import { OrganizationName } from '@/types/organization';

const t = (language_code: string, name: string, id = 1, organization = 1): OrganizationName => ({
  id,
  organization,
  language_code,
  name,
});

const DEFAULT = 'Default Org Name';

describe('getOrganizationDisplayName - no translations', () => {
  it.each([
    ['empty array', []],
    ['undefined', undefined as any],
    ['null', null as any],
  ])('returns defaultName when translations is %s', (_label, translations) => {
    expect(getOrganizationDisplayName(DEFAULT, translations, 'en')).toBe(DEFAULT);
  });
});

describe('getOrganizationDisplayName - exact language match', () => {
  const translations = [
    t('en', 'English Name'),
    t('pt', 'Portuguese Name'),
    t('es', 'Spanish Name'),
  ];

  it.each([
    ['pt', 'Portuguese Name'],
    ['en', 'English Name'],
    ['es', 'Spanish Name'],
  ])('returns correct name for language %s', (lang, expected) => {
    expect(getOrganizationDisplayName(DEFAULT, translations, lang)).toBe(expected);
  });
});

describe('getOrganizationDisplayName - English fallback', () => {
  const translations = [t('en', 'English Name'), t('fr', 'French Name')];

  it.each(['de', 'ja'])('falls back to English for unavailable language %s', lang => {
    expect(getOrganizationDisplayName(DEFAULT, translations, lang)).toBe('English Name');
  });
});

describe('getOrganizationDisplayName - first translation fallback', () => {
  it('returns first translation when user language and English are unavailable', () => {
    const translations = [t('fr', 'French Name'), t('de', 'German Name')];
    expect(getOrganizationDisplayName(DEFAULT, translations, 'ja')).toBe('French Name');
  });
});

describe('getOrganizationDisplayName - defaultName ultimate fallback', () => {
  it('returns defaultName when translations array is truly empty', () => {
    expect(getOrganizationDisplayName(DEFAULT, [], 'ja')).toBe(DEFAULT);
  });
});

describe('getOrganizationDisplayName - language code normalisation', () => {
  const translations = [t('pt-br', 'Brazilian Portuguese Name'), t('en', 'English Name')];

  it.each([
    ['pt-br', 'Brazilian Portuguese Name'],
    ['pt-BR', 'Brazilian Portuguese Name'],
    ['ptbr', 'Brazilian Portuguese Name'],
  ])('matches pt-br translation with %s user language', (lang, expected) => {
    expect(getOrganizationDisplayName(DEFAULT, translations, lang)).toBe(expected);
  });
});

describe('getOrganizationDisplayName - base language matching', () => {
  it.each([
    ['es-MX', 'es', 'Spanish Name'],
    ['fr-CA', 'fr', 'French Name'],
  ])('falls back to English when %s does not match %s', (userLang, transLang, transName) => {
    const translations = [t(transLang, transName), t('en', 'English Name')];
    expect(getOrganizationDisplayName(DEFAULT, translations, userLang)).toBe('English Name');
  });
});

describe('getOrganizationDisplayName - default parameters', () => {
  it('defaults userLanguage to en when not provided', () => {
    const translations = [t('en', 'English Name'), t('fr', 'French Name')];
    expect(getOrganizationDisplayName(DEFAULT, translations)).toBe('English Name');
  });

  it('defaults translations to [] when not provided', () => {
    expect(getOrganizationDisplayName(DEFAULT)).toBe(DEFAULT);
  });
});

describe('getOrganizationDisplayName - edge cases', () => {
  it('handles empty language_code in translation gracefully', () => {
    const translations = [t('', 'No Lang Name'), t('en', 'English Name')];
    expect(getOrganizationDisplayName(DEFAULT, translations, 'en')).toBe('English Name');
  });

  it.each([
    ['matches', 'de', 'de', 'German Name'],
    ['does not match (falls back to first)', 'de', 'ja', 'German Name'],
  ])('handles single translation that %s', (_label, transLang, userLang, expected) => {
    const translations = [t(transLang, 'German Name')];
    expect(getOrganizationDisplayName(DEFAULT, translations, userLang)).toBe(expected);
  });
});
