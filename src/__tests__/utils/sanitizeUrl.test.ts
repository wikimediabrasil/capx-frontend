import { sanitizeUrl, sanitizeContactUrls } from '@/lib/utils/sanitizeUrl';

describe('sanitizeUrl', () => {
  it('returns empty string for null/undefined/empty', () => {
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl(undefined)).toBe('');
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl('   ')).toBe('');
  });

  it('adds https:// when no protocol', () => {
    expect(sanitizeUrl('example.com')).toBe('https://example.com');
    expect(sanitizeUrl('www.example.com/path')).toBe('https://www.example.com/path');
  });

  it('keeps existing protocol', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    expect(sanitizeUrl('ftp://files.example.com')).toBe('ftp://files.example.com');
  });

  it('trims whitespace', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
    expect(sanitizeUrl('  example.com  ')).toBe('https://example.com');
  });
});

describe('sanitizeContactUrls', () => {
  it('sanitizes website and meta_page but not email', () => {
    const result = sanitizeContactUrls({
      email: 'test@example.com',
      website: 'example.com',
      meta_page: 'meta.wikimedia.org',
    });
    expect(result.email).toBe('test@example.com');
    expect(result.website).toBe('https://example.com');
    expect(result.meta_page).toBe('https://meta.wikimedia.org');
  });

  it('handles empty contacts', () => {
    const result = sanitizeContactUrls({});
    expect(result.email).toBe('');
    expect(result.website).toBe('');
    expect(result.meta_page).toBe('');
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
