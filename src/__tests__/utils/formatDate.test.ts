import { formatDateToLocaleString, formatDateTimeToLocaleString } from '@/lib/utils/formatDate';

describe('formatDateToLocaleString', () => {
  it('formats valid ISO date string', () => {
    const result = formatDateToLocaleString('2023-08-15T14:30:00.000Z');
    expect(result).toBeTruthy();
    expect(result).not.toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(formatDateToLocaleString('not-a-date')).toBe('');
    expect(formatDateToLocaleString('invalid')).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(formatDateToLocaleString('')).toBe('');
  });
});

describe('formatDateTimeToLocaleString', () => {
  it('formats valid ISO datetime string', () => {
    const result = formatDateTimeToLocaleString('2023-08-15T14:30:00.000Z');
    expect(result).toBeTruthy();
    expect(result).not.toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(formatDateTimeToLocaleString('not-a-date')).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(formatDateTimeToLocaleString('')).toBe('');
  });
});
