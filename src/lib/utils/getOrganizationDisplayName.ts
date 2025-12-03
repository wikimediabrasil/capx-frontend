import { OrganizationName } from '@/types/organization';

/**
 * Gets the display name for an organization based on the user's language.
 * Falls back to English (en) if the language is not available.
 * Falls back to the default display_name if no translations exist.
 *
 * @param defaultName - The default display_name from the organization
 * @param translations - Array of organization name translations
 * @param userLanguage - The user's current language code (e.g., 'en', 'pt', 'es')
 * @returns The translated name or fallback
 */
/**
 * Normalizes language codes for comparison (handles pt-br, ptbr, pt-BR, etc.)
 */
function normalizeLanguageCode(code: string): string {
  if (!code) return '';
  // Convert to lowercase and replace common variations
  const normalized = code.toLowerCase().replace(/[_-]/g, '');

  // Handle common variations
  if (normalized === 'ptbr' || normalized === 'ptbr') {
    return 'pt-br';
  }

  // Return normalized code (lowercase, no separators)
  return normalized;
}

/**
 * Checks if two language codes match (handles variations)
 */
function languageCodesMatch(code1: string, code2: string): boolean {
  const normalized1 = normalizeLanguageCode(code1);
  const normalized2 = normalizeLanguageCode(code2);

  // Direct match
  if (normalized1 === normalized2) {
    return true;
  }

  // Handle pt-br variations
  if (
    (normalized1 === 'ptbr' || normalized1 === 'pt-br') &&
    (normalized2 === 'ptbr' || normalized2 === 'pt-br')
  ) {
    return true;
  }

  // Handle base language matching (e.g., 'pt' matches 'pt-br')
  const base1 = normalized1.split('-')[0] || normalized1.split('_')[0] || normalized1;
  const base2 = normalized2.split('-')[0] || normalized2.split('_')[0] || normalized2;

  // Only match base if both are the same and not already matched
  if (base1 === base2 && normalized1 !== normalized2) {
    // For pt, prefer pt-br over pt
    if (base1 === 'pt') {
      return normalized1.includes('br') || normalized2.includes('br');
    }
    return true;
  }

  return false;
}

export function getOrganizationDisplayName(
  defaultName: string,
  translations: OrganizationName[] = [],
  userLanguage: string = 'en'
): string {
  // If no translations, return default name
  if (!translations || translations.length === 0) {
    return defaultName;
  }

  // Normalize user language
  const normalizedUserLang = normalizeLanguageCode(userLanguage);

  // Try to find exact match first
  let userLanguageTranslation = translations.find(t =>
    languageCodesMatch(t.language_code, userLanguage)
  );

  // If no exact match, try to find by base language (e.g., 'pt' matches 'pt-br')
  if (!userLanguageTranslation && normalizedUserLang) {
    const baseLang =
      normalizedUserLang.split('-')[0] || normalizedUserLang.split('_')[0] || normalizedUserLang;
    userLanguageTranslation = translations.find(t => {
      const tLang = normalizeLanguageCode(t.language_code);
      const tBase = tLang.split('-')[0] || tLang.split('_')[0] || tLang;
      return tBase === baseLang;
    });
  }

  if (userLanguageTranslation) {
    return userLanguageTranslation.name;
  }

  // Fallback to English
  const englishTranslation = translations.find(
    t => normalizeLanguageCode(t.language_code) === 'en'
  );

  if (englishTranslation) {
    return englishTranslation.name;
  }

  // If no English translation, return the first available translation
  if (translations.length > 0) {
    return translations[0].name;
  }

  // Final fallback to default name
  return defaultName;
}
