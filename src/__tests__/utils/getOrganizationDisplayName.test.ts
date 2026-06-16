import { getOrganizationDisplayName } from '@/lib/utils/getOrganizationDisplayName';
import { OrganizationName } from '@/types/organization';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const t = (language_code: string, name: string, id = 1, organization = 1): OrganizationName => ({
  id,
  organization,
  language_code,
  name,
});

const DEFAULT = 'Default Org Name';

// ---------------------------------------------------------------------------
// No translations
// ---------------------------------------------------------------------------
describe('getOrganizationDisplayName - no translations', () => {
  it('returns defaultName when translations is empty array', () => {
    expect(getOrganizationDisplayName(DEFAULT, [], 'en')).toBe(DEFAULT);
  });

  it('returns defaultName when translations is undefined', () => {
    expect(getOrganizationDisplayName(DEFAULT, undefined as any, 'en')).toBe(DEFAULT);
  });

  it('returns defaultName when translations is null', () => {
    expect(getOrganizationDisplayName(DEFAULT, null as any, 'en')).toBe(DEFAULT);
  });
});

// ---------------------------------------------------------------------------
// Exact language match
// ---------------------------------------------------------------------------
describe('getOrganizationDisplayName - exact language match', () => {
  const translations = [
    t('en', 'English Name'),
    t('pt', 'Portuguese Name'),
    t('es', 'Spanish Name'),
  ];

  it('returns the name for the exact requested language', () => {
    expect(getOrganizationDisplayName(DEFAULT, translations, 'pt')).toBe('Portuguese Name');
  });

  it('returns the English name when user language is en', () => {
    expect(getOrganizationDisplayName(DEFAULT, translations, 'en')).toBe('English Name');
  });

  it('returns Spanish name for es', () => {
    expect(getOrganizationDisplayName(DEFAULT, translations, 'es')).toBe('Spanish Name');
  });
});

// ---------------------------------------------------------------------------
// Fallback to English
// ---------------------------------------------------------------------------
describe('getOrganizationDisplayName - English fallback', () => {
  const translations = [t('en', 'English Name'), t('fr', 'French Name')];

  it('falls back to English when requested language not available', () => {
    expect(getOrganizationDisplayName(DEFAULT, translations, 'de')).toBe('English Name');
  });

  it('falls back to English when user language is missing entirely', () => {
    expect(getOrganizationDisplayName(DEFAULT, translations, 'ja')).toBe('English Name');
  });
});

// ---------------------------------------------------------------------------
// Fallback to first available translation
// ---------------------------------------------------------------------------
describe('getOrganizationDisplayName - first translation fallback', () => {
  const translations = [t('fr', 'French Name'), t('de', 'German Name')];

  it('returns first translation when user language and English are unavailable', () => {
    expect(getOrganizationDisplayName(DEFAULT, translations, 'ja')).toBe('French Name');
  });
});

// ---------------------------------------------------------------------------
// Final fallback to defaultName
// ---------------------------------------------------------------------------
describe('getOrganizationDisplayName - defaultName ultimate fallback', () => {
  it('returns defaultName when translations array is truly empty', () => {
    expect(getOrganizationDisplayName(DEFAULT, [], 'ja')).toBe(DEFAULT);
  });
});

// ---------------------------------------------------------------------------
// Language code normalisation: pt-br, ptbr, pt-BR
// ---------------------------------------------------------------------------
describe('getOrganizationDisplayName - language code normalisation', () => {
  const translations = [t('pt-br', 'Brazilian Portuguese Name'), t('en', 'English Name')];

  it('matches pt-br translation with pt-br user language', () => {
    expect(getOrganizationDisplayName(DEFAULT, translations, 'pt-br')).toBe(
      'Brazilian Portuguese Name'
    );
  });

  it('matches pt-br translation with pt-BR user language (case insensitive)', () => {
    expect(getOrganizationDisplayName(DEFAULT, translations, 'pt-BR')).toBe(
      'Brazilian Portuguese Name'
    );
  });

  it('matches pt-br translation with ptbr user language (no separator)', () => {
    expect(getOrganizationDisplayName(DEFAULT, translations, 'ptbr')).toBe(
      'Brazilian Portuguese Name'
    );
  });
});

// ---------------------------------------------------------------------------
// Base language matching
// ---------------------------------------------------------------------------
describe('getOrganizationDisplayName - base language matching', () => {
  it('falls back to English when es-MX does not match es (normalizer strips hyphen)', () => {
    // normalizeLanguageCode('es-MX') → 'esmx', base split('-')[0] → 'esmx' ≠ 'es'
    const translations = [t('es', 'Spanish Name'), t('en', 'English Name')];
    expect(getOrganizationDisplayName(DEFAULT, translations, 'es-MX')).toBe('English Name');
  });

  it('falls back to English when fr-CA does not match fr (normalizer strips hyphen)', () => {
    const translations = [t('fr', 'French Name'), t('en', 'English Name')];
    expect(getOrganizationDisplayName(DEFAULT, translations, 'fr-CA')).toBe('English Name');
  });
});

// ---------------------------------------------------------------------------
// Default userLanguage parameter
// ---------------------------------------------------------------------------
describe('getOrganizationDisplayName - default parameters', () => {
  it('defaults userLanguage to en when not provided', () => {
    const translations = [t('en', 'English Name'), t('fr', 'French Name')];
    expect(getOrganizationDisplayName(DEFAULT, translations)).toBe('English Name');
  });

  it('defaults translations to [] when not provided', () => {
    expect(getOrganizationDisplayName(DEFAULT)).toBe(DEFAULT);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('getOrganizationDisplayName - edge cases', () => {
  it('handles empty language_code in translation gracefully', () => {
    const translations = [t('', 'No Lang Name'), t('en', 'English Name')];
    expect(getOrganizationDisplayName(DEFAULT, translations, 'en')).toBe('English Name');
  });

  it('handles single translation that matches', () => {
    const translations = [t('de', 'German Name')];
    expect(getOrganizationDisplayName(DEFAULT, translations, 'de')).toBe('German Name');
  });

  it('handles single translation that does not match and has no English - falls back to first', () => {
    const translations = [t('de', 'German Name')];
    expect(getOrganizationDisplayName(DEFAULT, translations, 'ja')).toBe('German Name');
  });
});
