/**
 * Utility to validate document URLs and provide helpful error messages
 */

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
  normalizedUrl?: string;
}

export const validateDocumentUrl = (url: string): UrlValidationResult => {
  // Basic checks
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL is required and must be a string',
    };
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl === '') {
    return {
      isValid: false,
      error: 'URL cannot be empty',
    };
  }

  // Check if URL has protocol
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return {
      isValid: false,
      error: 'URL must start with http:// or https://',
      suggestion: `Try: https://${trimmedUrl}`,
      normalizedUrl: `https://${trimmedUrl}`,
    };
  }

  // Try to parse as URL
  try {
    return {
      isValid: true,
      normalizedUrl: trimmedUrl,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Invalid URL format: ${error.message}`,
      suggestion: 'Please check the URL format and try again',
    };
  }
};

/**
 * Validates document URLs specifically for CapX requirements:
 * - Must be from commons.wikimedia.org or upload.wikimedia.org
 * - Must be less than 200 characters
 * - Returns translation keys for error messages
 */
export const validateCapXDocumentUrl = (url: string): UrlValidationResult => {
  // Basic checks
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'snackbar-edit-profile-organization-document-url-invalid-format',
    };
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl === '') {
    return {
      isValid: false,
      error: 'snackbar-edit-profile-organization-document-url-invalid-format',
    };
  }

  // Check URL length (max 200 characters)
  if (trimmedUrl.length > 200) {
    return {
      isValid: false,
      error: 'snackbar-edit-profile-organization-document-url-too-long',
    };
  }

  // Check if URL has protocol
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return {
      isValid: false,
      error: 'snackbar-edit-profile-organization-document-url-invalid-format',
      suggestion: `Try: https://${trimmedUrl}`,
      normalizedUrl: `https://${trimmedUrl}`,
    };
  }

  // Try to parse as URL
  try {
    const urlObj = new URL(trimmedUrl);

    // Check if it's a Wikimedia Commons URL (required by CapX backend)
    const isCommonsUrl = urlObj.hostname === 'commons.wikimedia.org';
    const isUploadUrl = urlObj.hostname === 'upload.wikimedia.org';

    if (!isCommonsUrl && !isUploadUrl) {
      return {
        isValid: false,
        error: 'snackbar-edit-profile-organization-invalid-document-url',
      };
    }

    return {
      isValid: true,
      normalizedUrl: trimmedUrl,
    };
  } catch {
    return {
      isValid: false,
      error: 'snackbar-edit-profile-organization-document-url-invalid-format',
      suggestion: 'Please check the URL format and try again',
    };
  }
};

export const normalizeDocumentUrl = (url: string): string => {
  const validation = validateDocumentUrl(url);

  if (validation.isValid && validation.normalizedUrl) {
    return validation.normalizedUrl;
  }

  if (validation.normalizedUrl) {
    return validation.normalizedUrl;
  }

  return url.trim();
};
