/**
 * Sanitizes a URL by adding https:// prefix if no protocol is present
 * @param url - The URL to sanitize
 * @returns The sanitized URL with proper protocol
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url || url.trim() === '') {
    return '';
  }

  const trimmedUrl = url.trim();

  // Check if URL already has a protocol (http://, https://, ftp://, etc.)
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmedUrl);

  if (hasProtocol) {
    return trimmedUrl;
  }

  // Add https:// prefix if no protocol is present
  return `https://${trimmedUrl}`;
}

/**
 * Sanitizes contact data URLs (website, meta_page)
 * Email addresses are not sanitized
 */
export function sanitizeContactUrls(contacts: {
  email?: string;
  website?: string;
  meta_page?: string;
}): {
  email?: string;
  website?: string;
  meta_page?: string;
} {
  return {
    email: contacts.email || '',
    website: sanitizeUrl(contacts.website),
    meta_page: sanitizeUrl(contacts.meta_page),
  };
}
