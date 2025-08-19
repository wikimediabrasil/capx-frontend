import NoAvatarIcon from '@/public/static/images/no_avatar.svg';
import { WikimediaDocument } from '@/types/document';
import { WikimediaImage } from '@/types/wikidataImage';

/**
 * Extracts the filename from various Wikimedia URL patterns so it can be used
 * with the Commons API `titles=File:<filename>` parameter.
 */

const decodeUntilStable = (value: string, maxAttempts = 3): string => {
  let result = value;
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const decoded = decodeURIComponent(result);
      if (decoded === result) return result;
      result = decoded;
    } catch {
      return result;
    }
  }
  return result;
};

const extractWikimediaFilename = (url: string | undefined | null): string => {
  if (!url) return '';

  const trimmed = url.trim();

  // Accept raw File:Name.ext input
  if (trimmed.startsWith('File:')) {
    return decodeUntilStable(trimmed.replace(/^File:/, ''));
  }

  // Standard Commons file page
  if (trimmed.includes('commons.wikimedia.org/wiki/File:')) {
    return decodeUntilStable(trimmed.split('File:')[1]);
  }

  // Special:FilePath (often used with width query params)
  if (trimmed.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
    const after = trimmed.split('commons.wikimedia.org/wiki/Special:FilePath/')[1];
    // Drop any querystring like ?width=384
    const noQuery = after.split('?')[0];
    // API expects the canonical filename (not URL-encoded)
    return decodeUntilStable(noQuery);
  }

  // Direct upload URL
  if (trimmed.includes('upload.wikimedia.org/wikipedia/commons/')) {
    const parts = trimmed.split('/');
    const last = parts[parts.length - 1];
    return decodeUntilStable(last);
  }

  // Unknown format – if it references Wikimedia, try best-effort last segment
  if (trimmed.includes('wikimedia.org') || trimmed.includes('wikipedia.org')) {
    const parts = trimmed.split('/');
    const last = parts[parts.length - 1].split('?')[0];
    return decodeUntilStable(last);
  }

  // Not a Wikimedia file URL
  return '';
};

export const fetchWikimediaData = async (url: string): Promise<WikimediaDocument> => {
  try {
    const fileName = extractWikimediaFilename(url);

    if (!fileName) {
      return {
        id: 0,
        title: '',
        imageUrl: '',
        fullUrl: '',
        metadata: [],
      };
    }

    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&formatversion=2&format=json&iiprop=url%7Cmetadata&iiurlheight=200&titles=File:${encodeURIComponent(
      fileName
    )}&origin=*`;

    const response = await fetch(apiUrl);
    const data: WikimediaImage = await response.json();

    if (data.query?.pages?.[0]) {
      const page = data.query.pages[0];
      const imageInfo = page.imageinfo?.[0];

      return {
        id: 0,
        title: page.title?.replace('File:', '') || fileName,
        imageUrl: imageInfo?.thumburl,
        // Fallback to the canonical file page if direct url is missing
        fullUrl:
          imageInfo?.url ||
          `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName)}`,
        metadata: imageInfo?.metadata,
        thumburl: imageInfo?.thumburl,
      };
    }
    return {
      id: 0,
      title: '',
      imageUrl: '',
      fullUrl: '',
      metadata: [],
    };
  } catch (error) {
    console.error('Error fetching Wikimedia data:', error);
    return {
      id: 0,
      title: '',
      imageUrl: '',
      fullUrl: '',
      metadata: [],
    };
  }
};

export const formatWikiImageUrl = (url: string | undefined): string => {
  if (!url || url.trim() === '') return NoAvatarIcon;

  if (url.includes('upload.wikimedia.org')) {
    return url;
  }

  const requiresPageThumb = (fileName: string): boolean => {
    const lower = fileName.toLowerCase();
    return lower.endsWith('.pdf') || lower.endsWith('.djvu') || lower.endsWith('.tsl');
  };

  if (url.includes('commons.wikimedia.org/wiki/File:')) {
    const raw = url.split('File:')[1];
    const fileName = decodeUntilStable(raw);
    // Non-image documents need a thumbnail
    if (requiresPageThumb(fileName)) {
      return `https://commons.wikimedia.org/w/thumb.php?f=${encodeURIComponent(fileName)}&page=1&w=384`;
    }
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=384`;
  }

  if (url.startsWith('File:')) {
    const raw = url.replace('File:', '');
    const fileName = decodeUntilStable(raw);
    if (requiresPageThumb(fileName)) {
      return `https://commons.wikimedia.org/w/thumb.php?f=${encodeURIComponent(fileName)}&page=1&w=384`;
    }
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=384`;
  }

  return url;
};

export const getWikiBirthday = async (username: string) => {
  try {
    const response = await fetch(
      `https://meta.wikimedia.org/w/api.php?action=query&meta=globaluserinfo&formatversion=2&guiprop=merged&guiuser=${encodeURIComponent(
        username
      )}&origin=*&format=json`
    );

    const data = await response.json();

    if (data.query?.globaluserinfo?.merged) {
      const oldestRegistration = data.query.globaluserinfo.merged
        .filter((instance: any) => instance.registration)
        .map((instance: any) => instance.registration)
        .sort()[0];

      return oldestRegistration;
    }

    return null;
  } catch (error) {
    console.error('Error fetching wiki user info:', error);
    return null;
  }
};
