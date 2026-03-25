/**
 * Canonical profile URL for sharing / QR codes. Encodes the username in the path
 * so the result is a valid https URL (better recognized by phone cameras as a link).
 */
export function getPublicProfileUrl(username: string): string {
  if (typeof window === 'undefined' || !username.trim()) return '';
  try {
    const path = `/profile/${encodeURIComponent(username)}`;
    return new URL(path, window.location.origin).href;
  } catch {
    return '';
  }
}
