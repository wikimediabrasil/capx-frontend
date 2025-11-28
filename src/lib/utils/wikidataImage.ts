/**
 * Utility functions for fetching and managing Wikidata images
 */

/**
 * Fetches the image URL from a Wikidata item using SPARQL query
 * @param qid - Wikidata QID (e.g., "Q107707826")
 * @returns The image URL from Wikidata or null if not found
 */
export const fetchWikidataImage = async (qid: string): Promise<string | null> => {
  try {
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

    if (data?.results?.bindings?.length > 0) {
      return data.results.bindings[0].image.value;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Wikidata image:', error);
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
