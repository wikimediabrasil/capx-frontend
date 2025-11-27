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
export function getOrganizationDisplayName(
  defaultName: string,
  translations: OrganizationName[] = [],
  userLanguage: string = 'en'
): string {
  // If no translations, return default name
  if (!translations || translations.length === 0) {
    return defaultName;
  }

  // Try to find translation for user's language
  const userLanguageTranslation = translations.find(
    t => t.language_code.toLowerCase() === userLanguage.toLowerCase()
  );

  if (userLanguageTranslation) {
    return userLanguageTranslation.name;
  }

  // Fallback to English
  const englishTranslation = translations.find(
    t => t.language_code.toLowerCase() === 'en'
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

