import { capitalizeFirstLetter } from '@/lib/utils/stringUtils';

describe('capitalizeFirstLetter', () => {
  it('capitalizes the first letter', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
    expect(capitalizeFirstLetter('world')).toBe('World');
  });

  it('returns empty string for empty input', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  it('handles already capitalized strings', () => {
    expect(capitalizeFirstLetter('Hello')).toBe('Hello');
  });

  it('handles single character', () => {
    expect(capitalizeFirstLetter('a')).toBe('A');
  });

  it('preserves rest of string', () => {
    expect(capitalizeFirstLetter('hELLO WORLD')).toBe('HELLO WORLD');
  });
});
