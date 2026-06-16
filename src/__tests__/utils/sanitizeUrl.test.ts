import { sanitizeUrl, sanitizeContactUrls } from '@/lib/utils/sanitizeUrl';

describe('sanitizeUrl', () => {
  it.each([
    [null, ''],
    [undefined, ''],
    ['', ''],
    ['   ', ''],
  ])('returns empty string for %p', (input, expected) => {
    expect(sanitizeUrl(input)).toBe(expected);
  });

  it.each([
    ['example.com', 'https://example.com'],
    ['www.example.com/path', 'https://www.example.com/path'],
    ['  example.com  ', 'https://example.com'],
    ['  https://example.com  ', 'https://example.com'],
  ])('sanitizes %p to %p', (input, expected) => {
    expect(sanitizeUrl(input)).toBe(expected);
  });

  it.each([['https://example.com'], ['ftp://files.example.com']])(
    'preserves existing protocol in %p',
    url => {
      expect(sanitizeUrl(url)).toBe(url);
    }
  );
});

describe('sanitizeContactUrls', () => {
  it('sanitizes website and meta_page but not email', () => {
    const result = sanitizeContactUrls({
      email: 'test@example.com',
      website: 'example.com',
      meta_page: 'meta.wikimedia.org',
    });
    expect(result).toEqual({
      email: 'test@example.com',
      website: 'https://example.com',
      meta_page: 'https://meta.wikimedia.org',
    });
  });

  it('handles empty contacts', () => {
    expect(sanitizeContactUrls({})).toEqual({
      email: '',
      website: '',
      meta_page: '',
    });
  });

  it('preserves URLs that already have protocols', () => {
    const result = sanitizeContactUrls({
      website: 'https://example.com',
      meta_page: 'https://meta.wikimedia.org',
    });
    expect(result.website).toBe('https://example.com');
    expect(result.meta_page).toBe('https://meta.wikimedia.org');
  });
});
