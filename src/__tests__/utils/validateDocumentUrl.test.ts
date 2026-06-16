import {
  validateDocumentUrl,
  validateCapXDocumentUrl,
  normalizeDocumentUrl,
} from '@/lib/utils/validateDocumentUrl';

// ---------------------------------------------------------------------------
// validateDocumentUrl
// ---------------------------------------------------------------------------
describe('validateDocumentUrl', () => {
  it('returns invalid for null/undefined input', () => {
    expect(validateDocumentUrl(null as any).isValid).toBe(false);
    expect(validateDocumentUrl(undefined as any).isValid).toBe(false);
  });

  it('returns invalid for non-string input', () => {
    expect(validateDocumentUrl(123 as any).isValid).toBe(false);
    expect(validateDocumentUrl(123 as any).error).toBe('URL is required and must be a string');
  });

  it('returns invalid for empty string', () => {
    const result = validateDocumentUrl('');
    expect(result.isValid).toBe(false);
    // Empty string is falsy, so it hits the first check
    expect(result.error).toBe('URL is required and must be a string');
  });

  it('returns invalid for whitespace-only string', () => {
    const result = validateDocumentUrl('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('URL cannot be empty');
  });

  it('returns invalid when no protocol is present and provides suggestion', () => {
    const result = validateDocumentUrl('commons.wikimedia.org/wiki/File:Test.jpg');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('http');
    expect(result.suggestion).toContain('https://');
    expect(result.normalizedUrl).toContain('https://');
  });

  it('returns valid for https:// URL', () => {
    const url = 'https://commons.wikimedia.org/wiki/File:Example.jpg';
    const result = validateDocumentUrl(url);
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe(url);
  });

  it('returns valid for https:// URL (alt)', () => {
    const url = 'https://commons.wikimedia.org/wiki/File:Example.jpg';
    const result = validateDocumentUrl(url);
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe(url);
  });

  it('trims leading/trailing whitespace before validating', () => {
    const result = validateDocumentUrl('  https://commons.wikimedia.org/wiki/File:Test.jpg  ');
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe('https://commons.wikimedia.org/wiki/File:Test.jpg');
  });
});

// ---------------------------------------------------------------------------
// validateCapXDocumentUrl
// ---------------------------------------------------------------------------
describe('validateCapXDocumentUrl', () => {
  it('returns invalid for null/undefined', () => {
    expect(validateCapXDocumentUrl(null as any).isValid).toBe(false);
    expect(validateCapXDocumentUrl(undefined as any).isValid).toBe(false);
    expect(validateCapXDocumentUrl(null as any).error).toBe(
      'snackbar-edit-profile-organization-document-url-invalid-format'
    );
  });

  it('returns invalid for empty string', () => {
    const result = validateCapXDocumentUrl('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('snackbar-edit-profile-organization-document-url-invalid-format');
  });

  it('returns invalid for whitespace-only string', () => {
    const result = validateCapXDocumentUrl('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('snackbar-edit-profile-organization-document-url-invalid-format');
  });

  it('returns too-long error when URL exceeds 200 characters', () => {
    const longUrl = 'https://commons.wikimedia.org/' + 'a'.repeat(200);
    const result = validateCapXDocumentUrl(longUrl);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('snackbar-edit-profile-organization-document-url-too-long');
  });

  it('accepts a valid commons URL that is exactly 200 characters long', () => {
    // Length limit is >200; exactly 200 is allowed
    const base = 'https://commons.wikimedia.org/wiki/File:';
    const padding = 'A'.repeat(200 - base.length);
    const url = base + padding;
    expect(url).toHaveLength(200);
    const result = validateCapXDocumentUrl(url);
    expect(result.isValid).toBe(true);
  });

  it('returns invalid when URL has no protocol', () => {
    const result = validateCapXDocumentUrl('commons.wikimedia.org/wiki/File:Test.jpg');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('snackbar-edit-profile-organization-document-url-invalid-format');
    expect(result.suggestion).toContain('https://');
    expect(result.normalizedUrl).toContain('https://');
  });

  it('returns invalid when domain is not commons or upload wikimedia', () => {
    const result = validateCapXDocumentUrl('https://en.wikipedia.org/wiki/File:Test.jpg');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('snackbar-edit-profile-organization-invalid-document-url');
  });

  it('returns invalid for arbitrary non-Wikimedia URL', () => {
    const result = validateCapXDocumentUrl('https://example.com/document.pdf');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('snackbar-edit-profile-organization-invalid-document-url');
  });

  it('returns valid for commons.wikimedia.org URL', () => {
    const url = 'https://commons.wikimedia.org/wiki/File:Example.jpg';
    const result = validateCapXDocumentUrl(url);
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe(url);
  });

  it('returns valid for upload.wikimedia.org URL', () => {
    const url = 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg';
    const result = validateCapXDocumentUrl(url);
    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe(url);
  });

  it('trims whitespace before validating', () => {
    const url = '  https://commons.wikimedia.org/wiki/File:Example.jpg  ';
    const result = validateCapXDocumentUrl(url);
    expect(result.isValid).toBe(true);
  });

  it('returns invalid for URL with empty hostname (https://)', () => {
    // new URL('https://') succeeds in Node.js but yields empty hostname,
    // so the domain check fails → returns invalid-document-url error
    const result = validateCapXDocumentUrl('https://');
    expect(result.isValid).toBe(false);
    // Either invalid-domain or invalid-format error key is acceptable
    expect(result.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// normalizeDocumentUrl
// ---------------------------------------------------------------------------
describe('normalizeDocumentUrl', () => {
  it('returns the URL as-is when valid with https://', () => {
    const url = 'https://commons.wikimedia.org/wiki/File:Example.jpg';
    expect(normalizeDocumentUrl(url)).toBe(url);
  });

  it('returns normalizedUrl (with https://) when URL has no protocol', () => {
    const url = 'commons.wikimedia.org/wiki/File:Example.jpg';
    const result = normalizeDocumentUrl(url);
    expect(result).toBe(`https://${url}`);
  });

  it('trims whitespace from bare URL that has no protocol', () => {
    // When there is no normalizedUrl and url is invalid, it returns url.trim()
    const result = normalizeDocumentUrl('  ');
    // empty after trim, validateDocumentUrl returns isValid:false and no normalizedUrl
    expect(result).toBe('');
  });

  it('returns trimmed URL for valid https:// URL', () => {
    const url = '  https://commons.wikimedia.org/wiki/File:Test.jpg  ';
    expect(normalizeDocumentUrl(url)).toBe('https://commons.wikimedia.org/wiki/File:Test.jpg');
  });
});
