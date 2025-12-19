/**
 * Utility functions for fetching and managing Wikidata images
 */

// In-memory cache for Wikidata images with 30-minute TTL
const wikidataImageCache = new Map<string, { url: string | null; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Fetches the image URL from a Wikidata item using SPARQL query
 * @param qid - Wikidata QID (e.g., "Q107707826")
 * @returns The image URL from Wikidata or null if not found
 */
export const fetchWikidataImage = async (qid: string): Promise<string | null> => {
  try {
    // Check cache first
    const cached = wikidataImageCache.get(qid);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.url;
    }

    const sparqlQuery = `
      SELECT ?image WHERE {
        wd:${qid} wdt:P18 ?image.
      }
    `;
    const encodedQuery = encodeURIComponent(sparqlQuery);
    const response = await fetch(
      `https://query.wikidata.org/sparql?query=${encodedQuery}&format=json`
    );
    const data = await response.json();

    let imageUrl: string | null = null;
    if (data?.results?.bindings?.length > 0) {
      imageUrl = data.results.bindings[0].image.value;
    }

    // Cache the result
    wikidataImageCache.set(qid, { url: imageUrl, timestamp: Date.now() });

    return imageUrl;
  } catch (error) {
    console.error('Error fetching Wikidata image:', error);
    // Cache null result to avoid repeated failed requests
    wikidataImageCache.set(qid, { url: null, timestamp: Date.now() });
    return null;
  }
};

/**
 * Determines if an avatar should use Wikidata image
 * Handles legacy data where avatar=1 was used for Wikidata logo
 *
 * @param avatar - Avatar ID from user/profile data
 * @param wikidataQid - Wikidata QID if configured
 * @returns true if should fetch from Wikidata
 */
export const shouldUseWikidataImage = (
  avatar: string | number | null | undefined,
  wikidataQid: string | null | undefined
): boolean => {
  if (!wikidataQid) return false;

  const avatarNum = avatar != null ? Number(avatar) : null;

  // Use Wikidata if:
  // 1. avatar is null/undefined/0 (explicitly set to use Wikidata)
  // 2. avatar is 1 AND wikidataQid exists (legacy data - avatar 1 was Wikidata logo)
  return avatarNum === null || avatarNum === 0 || (avatarNum === 1 && !!wikidataQid);
};
