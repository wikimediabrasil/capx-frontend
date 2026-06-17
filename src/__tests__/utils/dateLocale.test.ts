import {
  getDatePickerTexts,
  getLocaleFromLanguage,
  formatDateForLanguage,
  formatDateTimeForLanguage,
  dateTimeLocalToDate,
  dateToDateTimeLocal,
  applyLocaleToDateInput,
  setDocumentLocale,
} from '@/lib/utils/dateLocale';

// ---------------------------------------------------------------------------
// getDatePickerTexts
// ---------------------------------------------------------------------------
describe('getDatePickerTexts', () => {
  it('returns translated values when all keys present', () => {
    const pageContent = {
      'date-picker-today': 'Hoje',
      'date-picker-clear': 'Limpar',
      'date-picker-close': 'Fechar',
      'date-picker-time': 'Hora',
      'date-picker-date': 'Data',
    };
    const texts = getDatePickerTexts(pageContent);
    expect(texts).toEqual({
      today: 'Hoje',
      clear: 'Limpar',
      close: 'Fechar',
      time: 'Hora',
      date: 'Data',
    });
  });

  it('falls back to English defaults when keys are missing', () => {
    const texts = getDatePickerTexts({});
    expect(texts).toEqual({
      today: 'Today',
      clear: 'Clear',
      close: 'Close',
      time: 'Time',
      date: 'Date',
    });
  });

  it('uses fallback only for missing keys (partial content)', () => {
    const pageContent = { 'date-picker-today': 'Hoje' };
    const texts = getDatePickerTexts(pageContent);
    expect(texts.today).toBe('Hoje');
    expect(texts.clear).toBe('Clear');
    expect(texts.close).toBe('Close');
  });
});

// ---------------------------------------------------------------------------
// getLocaleFromLanguage
// ---------------------------------------------------------------------------
describe('getLocaleFromLanguage', () => {
  it('maps known language codes to their locales', () => {
    expect(getLocaleFromLanguage('en')).toBe('en-US');
    expect(getLocaleFromLanguage('pt')).toBe('pt-PT');
    expect(getLocaleFromLanguage('pt-br')).toBe('pt-BR');
    expect(getLocaleFromLanguage('es')).toBe('es-ES');
    expect(getLocaleFromLanguage('fr')).toBe('fr-FR');
    expect(getLocaleFromLanguage('de')).toBe('de-DE');
    expect(getLocaleFromLanguage('ja')).toBe('ja-JP');
    expect(getLocaleFromLanguage('ko')).toBe('ko-KR');
    expect(getLocaleFromLanguage('ar')).toBe('ar-SA');
    expect(getLocaleFromLanguage('ru')).toBe('ru-RU');
    expect(getLocaleFromLanguage('zh-hans')).toBe('zh-CN');
    expect(getLocaleFromLanguage('zh-hant')).toBe('zh-TW');
  });

  it('maps less common codes correctly', () => {
    expect(getLocaleFromLanguage('cy')).toBe('cy-GB');
    expect(getLocaleFromLanguage('ga')).toBe('ga-IE');
    expect(getLocaleFromLanguage('lb')).toBe('lb-LU');
    expect(getLocaleFromLanguage('skr-arab')).toBe('skr-Arab-PK');
  });

  it('defaults to en-US for unknown language codes', () => {
    expect(getLocaleFromLanguage('xx')).toBe('en-US');
    expect(getLocaleFromLanguage('')).toBe('en-US');
    expect(getLocaleFromLanguage('unknown-lang')).toBe('en-US');
  });
});

// ---------------------------------------------------------------------------
// formatDateForLanguage
// ---------------------------------------------------------------------------
describe('formatDateForLanguage', () => {
  // Use a fixed UTC date to avoid timezone-related variance in CI
  const date = new Date('2024-06-15T00:00:00.000Z');

  it('returns a non-empty string for a known language', () => {
    const result = formatDateForLanguage(date, 'en');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('produces different formatting for different locales', () => {
    const en = formatDateForLanguage(date, 'en');
    const de = formatDateForLanguage(date, 'de');
    // German typically uses dd.mm.yyyy while US uses mm/dd/yyyy - they should differ
    expect(en).not.toBe(de);
  });

  it('falls back gracefully for unknown language', () => {
    // Should not throw and returns a string (en-US fallback)
    const result = formatDateForLanguage(date, 'xx');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// formatDateTimeForLanguage
// ---------------------------------------------------------------------------
describe('formatDateTimeForLanguage', () => {
  const date = new Date('2024-06-15T14:30:00.000Z');

  it('returns a non-empty string for a known language', () => {
    const result = formatDateTimeForLanguage(date, 'en');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns a non-empty string for unknown language (fallback)', () => {
    const result = formatDateTimeForLanguage(date, 'xx');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('produces different output for different locales', () => {
    const en = formatDateTimeForLanguage(date, 'en');
    const fr = formatDateTimeForLanguage(date, 'fr');
    expect(en).not.toBe(fr);
  });
});

// ---------------------------------------------------------------------------
// dateTimeLocalToDate
// ---------------------------------------------------------------------------
describe('dateTimeLocalToDate', () => {
  it('converts a valid datetime-local string to a Date', () => {
    const result = dateTimeLocalToDate('2024-06-15T14:30');
    expect(result).toBeInstanceOf(Date);
    expect(Number.isNaN(result.getTime())).toBe(false);
  });

  it('treats the input as UTC (appends :00.000Z)', () => {
    const result = dateTimeLocalToDate('2024-06-15T14:30');
    expect(result.getUTCFullYear()).toBe(2024);
    expect(result.getUTCMonth()).toBe(5); // June = 5
    expect(result.getUTCDate()).toBe(15);
    expect(result.getUTCHours()).toBe(14);
    expect(result.getUTCMinutes()).toBe(30);
    expect(result.getUTCSeconds()).toBe(0);
  });

  it('returns a Date (current time approx) for empty string', () => {
    const before = Date.now();
    const result = dateTimeLocalToDate('');
    const after = Date.now();
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });

  it('handles midnight correctly', () => {
    const result = dateTimeLocalToDate('2024-01-01T00:00');
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCDate()).toBe(1);
    expect(result.getUTCMonth()).toBe(0);
    expect(result.getUTCFullYear()).toBe(2024);
  });
});

// ---------------------------------------------------------------------------
// dateToDateTimeLocal
// ---------------------------------------------------------------------------
describe('dateToDateTimeLocal', () => {
  it('converts a Date to YYYY-MM-DDTHH:mm format using UTC', () => {
    const date = new Date('2024-06-15T14:30:00.000Z');
    expect(dateToDateTimeLocal(date)).toBe('2024-06-15T14:30');
  });

  it('zero-pads month, day, hours, and minutes', () => {
    const date = new Date('2024-01-05T09:07:00.000Z');
    expect(dateToDateTimeLocal(date)).toBe('2024-01-05T09:07');
  });

  it('returns empty string for invalid Date', () => {
    expect(dateToDateTimeLocal(new Date('invalid'))).toBe('');
  });

  it('returns empty string for null', () => {
    expect(dateToDateTimeLocal(null as any)).toBe('');
  });

  it('is the inverse of dateTimeLocalToDate', () => {
    const original = '2024-06-15T14:30';
    const date = dateTimeLocalToDate(original);
    expect(dateToDateTimeLocal(date)).toBe(original);
  });

  it('handles year 2000 boundary', () => {
    const date = new Date('2000-01-01T00:00:00.000Z');
    expect(dateToDateTimeLocal(date)).toBe('2000-01-01T00:00');
  });
});

// ---------------------------------------------------------------------------
// applyLocaleToDateInput
// ---------------------------------------------------------------------------
describe('applyLocaleToDateInput', () => {
  let input: HTMLInputElement;
  let parent: HTMLDivElement;
  let grandparent: HTMLDivElement;

  beforeEach(() => {
    grandparent = document.createElement('div');
    parent = document.createElement('div');
    input = document.createElement('input');
    input.type = 'datetime-local';

    grandparent.appendChild(parent);
    parent.appendChild(input);
    document.body.appendChild(grandparent);
  });

  afterEach(() => {
    grandparent.remove();
  });

  it('sets the lang attribute on the input element', () => {
    applyLocaleToDateInput(input, 'pt');
    expect(input.getAttribute('lang')).toBe('pt-PT');
  });

  it('sets the lang attribute on ancestor elements up to (not including) body', () => {
    applyLocaleToDateInput(input, 'fr');
    expect(parent.getAttribute('lang')).toBe('fr-FR');
    expect(grandparent.getAttribute('lang')).toBe('fr-FR');
    // body itself should NOT have lang set by this function
    expect(document.body.getAttribute('lang')).toBeNull();
  });

  it('sets data-locale and data-language attributes', () => {
    applyLocaleToDateInput(input, 'de');
    expect(input.dataset.locale).toBe('de-DE');
    expect(input.dataset.language).toBe('de');
  });

  it('dispatches a change event on the element', () => {
    const changeHandler = jest.fn();
    input.addEventListener('change', changeHandler);
    applyLocaleToDateInput(input, 'en');
    expect(changeHandler).toHaveBeenCalledTimes(1);
  });

  it('works for unknown language (uses en-US locale)', () => {
    applyLocaleToDateInput(input, 'xx');
    expect(input.getAttribute('lang')).toBe('en-US');
  });
});

// ---------------------------------------------------------------------------
// setDocumentLocale
// ---------------------------------------------------------------------------
describe('setDocumentLocale', () => {
  afterEach(() => {
    // Clean up meta tags added during tests
    document
      .querySelectorAll('meta[http-equiv="Content-Language"], meta[name="language"]')
      .forEach(el => el.remove());
    document.documentElement.removeAttribute('lang');
  });

  it('sets document.documentElement.lang to the resolved locale', () => {
    setDocumentLocale('pt-br');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('creates Content-Language meta tag when not present', () => {
    setDocumentLocale('es');
    const meta = document.querySelector('meta[http-equiv="Content-Language"]');
    expect(meta).not.toBeNull();
    expect(meta!.getAttribute('content')).toBe('es-ES');
  });

  it('creates language meta tag when not present', () => {
    setDocumentLocale('de');
    const meta = document.querySelector('meta[name="language"]');
    expect(meta).not.toBeNull();
    expect(meta!.getAttribute('content')).toBe('de-DE');
  });

  it('updates existing Content-Language meta tag rather than creating a duplicate', () => {
    // Create the tag first
    const existing = document.createElement('meta');
    existing.setAttribute('http-equiv', 'Content-Language');
    existing.setAttribute('content', 'old-value');
    document.head.appendChild(existing);

    setDocumentLocale('fr');

    const metas = document.querySelectorAll('meta[http-equiv="Content-Language"]');
    expect(metas).toHaveLength(1);
    expect(metas[0].getAttribute('content')).toBe('fr-FR');

    existing.remove();
  });

  it('defaults to en-US locale for unknown language', () => {
    setDocumentLocale('xx');
    expect(document.documentElement.lang).toBe('en-US');
  });
});
