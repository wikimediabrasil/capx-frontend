/**
 * Utility to convert Wikimedia URLs between direct file URLs and Commons page URLs
 */

export interface WikimediaUrlConversion {
  isWikimediaUrl: boolean;
  originalUrl: string;
  commonsPageUrl?: string;
  directFileUrl?: string;
  filename?: string;
  error?: string;
}

/**
 * Converts a direct Wikimedia file URL to a Commons page URL
 * Example: 
 * https://upload.wikimedia.org/wikipedia/commons/e/e1/Wikipedia_de_A_a_Z.pdf
 * -> https://commons.wikimedia.org/wiki/File:Wikipedia_de_A_a_Z.pdf
 */
export const convertToCommonsPageUrl = (url: string): WikimediaUrlConversion => {
  const originalUrl = url.trim();
  
  // Check if it's already a Commons page URL
  if (originalUrl.includes('commons.wikimedia.org/wiki/File:')) {
    return {
      isWikimediaUrl: true,
      originalUrl,
      commonsPageUrl: originalUrl,
      filename: originalUrl.split('File:')[1]
    };
  }
  
  // Check if it's a direct upload URL
  const uploadUrlPattern = /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[a-f0-9]\/[a-f0-9]{2}\/(.+)$/;
  const match = originalUrl.match(uploadUrlPattern);
  
  if (match) {
    const filename = match[1];
    const commonsPageUrl = `https://commons.wikimedia.org/wiki/File:${filename}`;
    
    return {
      isWikimediaUrl: true,
      originalUrl,
      commonsPageUrl,
      directFileUrl: originalUrl,
      filename
    };
  }
  
  // Check if it's some other Wikimedia URL format
  if (originalUrl.includes('wikimedia.org') || originalUrl.includes('wikipedia.org')) {
    return {
      isWikimediaUrl: true,
      originalUrl,
      error: 'Unsupported Wikimedia URL format'
    };
  }
  
  // Not a Wikimedia URL
  return {
    isWikimediaUrl: false,
    originalUrl
  };
};

/**
 * Converts a Commons page URL to a direct file URL
 * Example:
 * https://commons.wikimedia.org/wiki/File:Wikipedia_de_A_a_Z.pdf
 * -> https://upload.wikimedia.org/wikipedia/commons/w/w1/Wikipedia_de_A_a_Z.pdf
 * Note: This requires additional API call to get the actual direct URL
 */
export const convertToDirectFileUrl = (url: string): WikimediaUrlConversion => {
  const originalUrl = url.trim();
  
  // Check if it's a Commons page URL
  if (originalUrl.includes('commons.wikimedia.org/wiki/File:')) {
    const filename = originalUrl.split('File:')[1];
    
    return {
      isWikimediaUrl: true,
      originalUrl,
      commonsPageUrl: originalUrl,
      filename,
      error: 'Direct file URL conversion requires API call to Commons'
    };
  }
  
  // Already a direct URL or not a Commons URL
  return convertToCommonsPageUrl(originalUrl);
};

/**
 * Ensures the URL is in the format expected by the backend (Commons page URL)
 */
export const ensureCommonsPageUrl = (url: string): string => {
  // Handle empty or whitespace-only strings
  if (!url || url.trim() === '') {
    return url.trim();
  }
  
  const conversion = convertToCommonsPageUrl(url);
  
  if (conversion.error) {
    console.warn('⚠️ URL conversion warning:', conversion.error, 'for URL:', url);
    return url; // Return original URL if conversion fails
  }
  
  if (conversion.commonsPageUrl) {

    return conversion.commonsPageUrl;
  }
  
  // Not a Wikimedia URL, return as-is
  return url;
}; 