/**
 * Profile path segment: whitespace becomes underscores, then the segment is
 * URI-encoded so reserved characters (e.g. &) become %XX — no %20 for spaces.
 */
export function toProfileSlug(username: string): string {
  return encodeURIComponent(username.replace(/\s+/g, '_'));
}

/**
 * Parses the `[username]` route param: URI-decode first, then treat `_` as space.
 */
export function fromProfileSlug(slug: string): string {
  if (!slug) return '';
  try {
    return decodeURIComponent(slug).split('_').join(' ');
  } catch {
    return slug.split('_').join(' ');
  }
}

/**
 * Canonical profile URL for sharing / QR codes. Produces a valid https URL
 * (better recognized by phone cameras as a link).
 */
export function getPublicProfileUrl(username: string): string {
  if (typeof window === 'undefined' || !username.trim()) return '';
  try {
    const path = `/profile/${toProfileSlug(username)}`;
    return new URL(path, window.location.origin).href;
  } catch {
    return '';
  }
}
