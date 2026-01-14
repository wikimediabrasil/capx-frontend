/**
 * Gets interface texts for the date picker using the app's translation system
 */
export function getDatePickerTexts(pageContent: Record<string, string>) {
  return {
    today: pageContent['date-picker-today'] || 'Today',
    clear: pageContent['date-picker-clear'] || 'Clear',
    close: pageContent['date-picker-close'] || 'Close',
    time: pageContent['date-picker-time'] || 'Time',
    date: pageContent['date-picker-date'] || 'Date',
  };
}

/**
 * Maps project language codes to JavaScript locale codes
 */
const languageToLocaleMap: Record<string, string> = {
  en: 'en-US',
  pt: 'pt-PT',
  'pt-br': 'pt-BR',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  'zh-hans': 'zh-CN',
  'zh-hant': 'zh-TW',
  ar: 'ar-SA',
  ru: 'ru-RU',
  nl: 'nl-NL',
  sv: 'sv-SE',
  tr: 'tr-TR',
  he: 'he-IL',
  id: 'id-ID',
  th: 'th-TH',
  vi: 'vi-VN',
  pl: 'pl-PL',
  cs: 'cs-CZ',
  sk: 'sk-SK',
  hu: 'hu-HU',
  ro: 'ro-RO',
  bg: 'bg-BG',
  hr: 'hr-HR',
  sr: 'sr-RS',
  sl: 'sl-SI',
  et: 'et-EE',
  lv: 'lv-LV',
  lt: 'lt-LT',
  fi: 'fi-FI',
  da: 'da-DK',
  no: 'nb-NO',
  is: 'is-IS',
  mt: 'mt-MT',
  cy: 'cy-GB',
  ga: 'ga-IE',
  gl: 'gl-ES',
  eu: 'eu-ES',
  ca: 'ca-ES',
  mk: 'mk-MK',
  sq: 'sq-AL',
  'sh-latn': 'sr-Latn-RS',
  'sh-cyrl': 'sr-Cyrl-RS',
  lb: 'lb-LU',
  ce: 'ce-RU',
  kaa: 'kaa-UZ',
  diq: 'diq-TR',
  pms: 'pms-IT',
  'skr-arab': 'skr-Arab-PK',
};

/**
 * Converts project language code to JavaScript locale code
 */
export function getLocaleFromLanguage(language: string): string {
  return languageToLocaleMap[language] || 'en-US';
}

/**
 * Formats a date according to the selected language
 */
export function formatDateForLanguage(date: Date, language: string): string {
  const locale = getLocaleFromLanguage(language);

  try {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    // Fallback to default format if the locale is not supported
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}

/**
 * Formats date and time according to the selected language
 */
export function formatDateTimeForLanguage(date: Date, language: string): string {
  const locale = getLocaleFromLanguage(language);

  try {
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: locale.startsWith('en-'), // Use 12h format only for English
    });
  } catch {
    // Fallback to default format if the locale is not supported
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}

/**
 * Converts datetime-local value to Date considering timezone
 */
export function dateTimeLocalToDate(dateTimeLocal: string): Date {
  if (!dateTimeLocal) return new Date();

  // datetime-local returns in format YYYY-MM-DDTHH:mm
  // We need to treat it as UTC to avoid timezone problems
  return new Date(dateTimeLocal + ':00.000Z');
}

/**
 * Converts Date to datetime-local format
 */
export function dateToDateTimeLocal(date: Date): string {
  if (!date || isNaN(date.getTime())) return '';

  // Convert to YYYY-MM-DDTHH:mm format for datetime-local
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Applies the locale to the date/time input using multiple strategies
 */
export function applyLocaleToDateInput(element: HTMLInputElement, language: string): void {
  const locale = getLocaleFromLanguage(language);

  // Strategy 1: lang attribute on the element and its parents
  element.setAttribute('lang', locale);

  // Apply lang to the parent elements as well
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    parent.setAttribute('lang', locale);
    parent = parent.parentElement;
  }

  // Strategy 2: Force re-rendering of the input
  try {
    const currentValue = element.value;
    const currentType = element.type;

    // Temporarily change the type to force re-rendering
    element.type = 'text';
    element.offsetHeight; // Trigger reflow
    element.type = currentType;
    element.value = currentValue;

    // Trigger change event to ensure React component detects it
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } catch (error) {
    console.warn('Could not force input re-render:', error);
  }

  // Strategy 3: Define additional attributes that can help
  try {
    element.setAttribute('data-locale', locale);
    element.setAttribute('data-language', language);
  } catch (error) {
    console.warn('Could not set additional locale attributes:', error);
  }
}

/**
 * Configures the locale globally in the document
 */
export function setDocumentLocale(language: string): void {
  const locale = getLocaleFromLanguage(language);

  try {
    // Define the locale in the document
    document.documentElement.lang = locale;

    // Add meta tag for locale if it doesn't exist
    let metaLocale = document.querySelector('meta[http-equiv="Content-Language"]');
    if (!metaLocale) {
      metaLocale = document.createElement('meta');
      metaLocale.setAttribute('http-equiv', 'Content-Language');
      document.head.appendChild(metaLocale);
    }
    metaLocale.setAttribute('content', locale);

    // Add meta tag for language if it doesn't exist
    let metaLang = document.querySelector('meta[name="language"]');
    if (!metaLang) {
      metaLang = document.createElement('meta');
      metaLang.setAttribute('name', 'language');
      document.head.appendChild(metaLang);
    }
    metaLang.setAttribute('content', locale);
  } catch (error) {
    console.warn('Could not set document locale:', error);
  }
}
