import SocialIcon from '@/public/static/images/cheer.svg';
import StrategicIcon from '@/public/static/images/chess_pawn.svg';
import CommunicationIcon from '@/public/static/images/communication.svg';
import CommunityIcon from '@/public/static/images/communities.svg';
import OrganizationalIcon from '@/public/static/images/corporate_fare.svg';
import LearningIcon from '@/public/static/images/local_library.svg';
import TechnologyIcon from '@/public/static/images/wifi_tethering.svg';
import { Capacity } from '@/types/capacity';
import axios from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { getApiBaseUrl } from './environment';

/**
 * Consolidated utility functions for handling capacity operations
 * This file combines all capacity-related utilities to avoid duplication
 */

// Types
export interface CapacityItem {
  code: number;
  name: string;
}

const colorMap: Record<string, string> = {
  organizational: '#0078D4',
  communication: '#BE0078',
  learning: '#00965A',
  community: '#8E44AD',
  social: '#D35400',
  strategic: '#3498DB',
  technology: '#27AE60',
};

export const isInvalidCapacityLabel = (name: string | undefined): boolean => {
  if (!name || !name.trim()) return true;
  const n = name.trim();
  return n.startsWith('http') || n.includes('entity/') || /^Q\d+$/i.test(n);
};

const filterMap: Record<string, string> = {
  '#0078D4':
    'invert(46%) sepia(66%) saturate(2299%) hue-rotate(187deg) brightness(102%) contrast(101%)', // organizational
  '#BE0078':
    'invert(21%) sepia(91%) saturate(3184%) hue-rotate(297deg) brightness(89%) contrast(96%)', // communication - novo ajuste para rosa
  '#00965A':
    'invert(48%) sepia(85%) saturate(385%) hue-rotate(115deg) brightness(97%) contrast(101%)', // learning
  '#8E44AD':
    'invert(29%) sepia(67%) saturate(860%) hue-rotate(225deg) brightness(89%) contrast(88%)', // community
  '#D35400':
    'invert(45%) sepia(95%) saturate(1480%) hue-rotate(347deg) brightness(98%) contrast(96%)', // social
  '#3498DB':
    'invert(50%) sepia(80%) saturate(850%) hue-rotate(187deg) brightness(95%) contrast(92%)', // strategic
  '#27AE60':
    'invert(56%) sepia(75%) saturate(436%) hue-rotate(93deg) brightness(132%) contrast(98%)', // technology
};

export const fetchCapacitiesWithFallback = async (
  codes: Array<{ code: number | string; wd_code: string }>,
  language: string
) => {
  try {
    // Always try Metabase first as it has metabase_code and already handles current language + English fallback
    const formattedCodes = codes.map(code => ({
      ...code,
      code: typeof code.code === 'string' ? parseInt(code.code, 10) : code.code,
    }));

    let metabaseResults: any[] = [];
    let wikidataResults: any[] = [];

    // Step 1: Try Metabase first (it already handles language fallback to English)
    try {
      metabaseResults = (await fetchMetabase(formattedCodes, language)) || [];
    } catch {
      // Continue with Wikidata if Metabase fails completely
    }

    // Step 2: If Metabase gave us results, check if any are missing descriptions
    if (metabaseResults.length > 0) {
      // Find results that have empty or missing descriptions
      const resultsMissingDescriptions = metabaseResults.filter(
        result => !result.description || result.description.trim() === ''
      );

      // If some results are missing descriptions, try to get them from Wikidata
      if (resultsMissingDescriptions.length > 0) {
        try {
          const codesForWikidata = resultsMissingDescriptions.map(result => ({
            code: result.code || 0,
            wd_code: result.wd_code,
          }));

          wikidataResults = (await fetchWikidata(codesForWikidata, language)) || [];

          // Merge results: Use Metabase as base, fill missing descriptions from Wikidata
          const mergedResults = metabaseResults.map(metabaseResult => {
            // If this result already has a description, keep it as-is
            if (metabaseResult.description && metabaseResult.description.trim() !== '') {
              return metabaseResult;
            }

            // Try to find matching Wikidata result for missing description
            const wikidataMatch = wikidataResults.find(wd => wd.wd_code === metabaseResult.wd_code);

            if (wikidataMatch && wikidataMatch.description) {
              const resolvedName = isInvalidCapacityLabel(metabaseResult.name)
                ? isInvalidCapacityLabel(wikidataMatch.name)
                  ? sanitizeCapacityName(
                      metabaseResult.name,
                      metabaseResult.code ?? metabaseResult.wd_code
                    )
                  : wikidataMatch.name
                : metabaseResult.name;
              return {
                ...metabaseResult,
                description: wikidataMatch.description,
                name: resolvedName,
              };
            }

            return metabaseResult;
          });

          return applyWikidataNameFallback(mergedResults, language);
        } catch {
          // If Wikidata fails, continue with name fallback below
        }
      }

      return applyWikidataNameFallback(metabaseResults, language);
    }

    // Step 3: If no results from Metabase, try Wikidata as final fallback
    try {
      wikidataResults = (await fetchWikidata(codes, language)) || [];

      // Add empty metabase_code to Wikidata results since they don't have it
      wikidataResults = wikidataResults.map(result => ({
        ...result,
        metabase_code: '', // Wikidata doesn't have metabase_code
      }));
    } catch {
      // Return empty array if both fail
    }

    return wikidataResults;
  } catch (error) {
    console.error('❌ Error in fetchCapacitiesWithFallback:', error);
    return [];
  }
};

export const getHueRotate = (color: string | undefined): string => {
  if (!color) return '';

  if (color.startsWith('#')) {
    return filterMap[color];
  }
  // get the filter based on the category name
  const filter = filterMap[colorMap[color]];

  if (filter) {
    return filter;
  }

  return '';
};

export const getCapacityColor = (color: string): string => {
  // if the color is a category (ex: "communication"), get the hex from colorMap
  const hexColor = colorMap[color];

  return hexColor || color || '#000000';
};

export const getCapacityIcon = (code: number): string => {
  const codeStr = code ? code.toString() : '';

  const iconMap: Record<string, string> = {
    '10': OrganizationalIcon,
    '36': CommunicationIcon,
    '50': LearningIcon,
    '56': CommunityIcon,
    '65': SocialIcon,
    '74': StrategicIcon,
    '106': TechnologyIcon,
  };

  // Check for prefix matches (more specific prefixes must come first)
  if (codeStr.startsWith('106')) return iconMap['106'];
  if (codeStr.startsWith('10')) return iconMap['10'];
  if (codeStr.startsWith('36')) return iconMap['36'];
  if (codeStr.startsWith('50')) return iconMap['50'];
  if (codeStr.startsWith('56')) return iconMap['56'];
  if (codeStr.startsWith('65')) return iconMap['65'];
  if (codeStr.startsWith('74')) return iconMap['74'];

  return iconMap['10']; // Default fallback
};

export const toggleChildCapacities = async (
  parentCode: string,
  expandedCapacities: Record<string, boolean>,
  setExpandedCapacities: Dispatch<SetStateAction<Record<string, boolean>>>,
  fetchCapacitiesByParent: (code: string) => Promise<any[]>,
  fetchCapacityDescription?: (code: number) => Promise<void>
) => {
  if (expandedCapacities[parentCode]) {
    setExpandedCapacities(prev => ({ ...prev, [parentCode]: false }));
    return;
  }

  const children = await fetchCapacitiesByParent(parentCode);

  if (fetchCapacityDescription) {
    for (const child of children) {
      if (child.code) {
        fetchCapacityDescription(Number(child.code));
      }
    }
  }

  setExpandedCapacities(prev => ({ ...prev, [parentCode]: true }));
};

/** Fetches human-readable labels via Wikidata Action API (reliable when SPARQL returns entity URIs). */
export const fetchWikidataLabelsViaApi = async (
  codes: Array<{ code?: number; wd_code: string }>,
  language: string
): Promise<Array<{ wd_code: string; name: string; code?: number; description: string }>> => {
  const wdIds = codes.map(c => c.wd_code).filter(Boolean);
  if (wdIds.length === 0) return [];

  const langBase = language.split('-')[0];
  const languageCandidates = [language, langBase, 'en'].filter(
    (v, i, arr) => v && arr.indexOf(v) === i
  );
  const BATCH_SIZE = 50;
  const results: Array<{ wd_code: string; name: string; code?: number; description: string }> = [];

  const baseUrl = getApiBaseUrl();

  for (let i = 0; i < wdIds.length; i += BATCH_SIZE) {
    const batch = wdIds.slice(i, i + BATCH_SIZE);
    let labelRows: Array<{ wd_code: string; name: string; description?: string }> = [];
    try {
      const response = await axios.get(`${baseUrl}/api/wikidata-labels`, {
        params: {
          ids: batch.join(','),
          languages: languageCandidates.join('|'),
        },
      });
      labelRows = response.data?.labels ?? [];
    } catch {
      // Proxy unavailable; skip batch
    }

    for (const row of labelRows) {
      const codeEntry = codes.find(c => c.wd_code?.toUpperCase() === row.wd_code?.toUpperCase());
      if (row.name && !isInvalidCapacityLabel(row.name)) {
        results.push({
          wd_code: row.wd_code,
          name: row.name,
          code: codeEntry?.code,
          description: row.description || '',
        });
      }
    }
  }

  return results;
};

export const fetchWikidata = async (codes: any, language: string) => {
  try {
    if (!codes || codes.length === 0 || !codes[0].wd_code) {
      console.warn('⚠️ fetchWikidata: No valid codes provided');
      return [];
    }

    const wdCodeList = codes.map((code: any) => 'wd:' + code.wd_code);
    const queryText = `SELECT ?item ?itemLabel ?itemDescription WHERE {VALUES ?item {${wdCodeList.join(
      ' '
    )}} SERVICE wikibase:label { bd:serviceParam wikibase:language '${language},en'.}}`;

    const baseUrl = getApiBaseUrl();
    const wikidataResponse = await axios.get(`${baseUrl}/api/wikidata-sparql`, {
      params: { format: 'json', query: queryText },
    });

    const sparqlResults = (wikidataResponse.data.results.bindings || [])
      .filter(
        (wdItem: any) =>
          wdItem.item && wdItem.item.value && wdItem.itemLabel && wdItem.itemLabel.value
      )
      .map((wdItem: any) => {
        const rawLabel = wdItem.itemLabel.value;
        const wd_code = wdItem.item.value.split('/').slice(-1)[0];
        const codeEntry = codes.find(
          (c: { wd_code: string }) => c.wd_code?.toUpperCase() === wd_code.toUpperCase()
        );
        return {
          wd_code,
          code: codeEntry?.code,
          name: isInvalidCapacityLabel(rawLabel) ? '' : rawLabel,
          description: wdItem.itemDescription?.value || '',
        };
      });

    const stillNeedingLabels = codes.filter((code: { wd_code: string; code?: number }) => {
      const match = sparqlResults.find(
        (r: { wd_code: string }) => r.wd_code?.toUpperCase() === code.wd_code?.toUpperCase()
      );
      return !match || isInvalidCapacityLabel(match.name);
    });

    if (stillNeedingLabels.length === 0) {
      return sparqlResults;
    }

    const apiLabels = await fetchWikidataLabelsViaApi(stillNeedingLabels, language);
    const mergedByWdCode = new Map<string, (typeof sparqlResults)[0]>();

    sparqlResults.forEach((r: { wd_code: string }) =>
      mergedByWdCode.set(r.wd_code.toUpperCase(), r)
    );
    apiLabels.forEach(apiResult => {
      mergedByWdCode.set(apiResult.wd_code.toUpperCase(), {
        ...mergedByWdCode.get(apiResult.wd_code.toUpperCase()),
        wd_code: apiResult.wd_code,
        code: apiResult.code ?? mergedByWdCode.get(apiResult.wd_code.toUpperCase())?.code,
        name: apiResult.name,
        description:
          apiResult.description ||
          mergedByWdCode.get(apiResult.wd_code.toUpperCase())?.description ||
          '',
      });
    });

    return Array.from(mergedByWdCode.values());
  } catch (error) {
    console.error('❌ Error in fetchWikidata:', error);
    try {
      return await fetchWikidataLabelsViaApi(codes, language);
    } catch {
      return [];
    }
  }
};

const isMetabaseBindingValid = (mbItem: any): boolean =>
  mbItem.item && mbItem.item.value && mbItem.itemLabel && mbItem.itemLabel.value && mbItem.value;

// Convert a single SPARQL binding into our Capacity-shaped result
const mapMetabaseBinding = (mbItem: any, codes: any, language: string) => {
  // Extract the Metabase ID from the item URI
  const itemUri = mbItem.item.value;
  const metabaseCode = itemUri.split('/').slice(-1)[0];

  // Check the language of the returned label
  const labelLanguage = mbItem.itemLabel?.['xml:lang'] || mbItem.itemLabel?.lang || 'en';
  const descriptionLanguage =
    mbItem.itemDescription?.['xml:lang'] || mbItem.itemDescription?.lang || 'en';

  // If we requested a specific language but got English back, it's a fallback
  // Also treat missing/empty descriptions as fallback since there's nothing translated
  const isLabelFallback = language !== 'en' && labelLanguage === 'en';
  const descriptionValue = mbItem.itemDescription?.value || '';
  const isDescriptionFallback =
    language !== 'en' && (descriptionLanguage === 'en' || descriptionValue.trim() === '');

  const rawLabel = mbItem.itemLabel.value;
  const wd_code = mbItem.value.value;
  const codeEntry = codes.find(
    (c: { wd_code: string }) => c.wd_code?.toUpperCase() === wd_code?.toUpperCase()
  );

  return {
    code: codeEntry?.code,
    wd_code,
    name: isInvalidCapacityLabel(rawLabel) ? '' : rawLabel,
    description: mbItem.itemDescription?.value || '',
    item: mbItem.item.value,
    metabase_code: metabaseCode,
    // Track if this result is using English fallback
    isFallbackLabel: isLabelFallback,
    isFallbackDescription: isDescriptionFallback,
    isFallbackTranslation: isLabelFallback || isDescriptionFallback,
  };
};

// Split large requests into batches to avoid URL length limits
const fetchMetabaseInBatches = async (
  codes: any,
  language: string,
  batchSize: number
): Promise<Capacity[]> => {
  const batchedResults: Capacity[] = [];
  for (let i = 0; i < codes.length; i += batchSize) {
    const batch = codes.slice(i, i + batchSize);
    try {
      const batchResults = await fetchMetabase(batch, language);
      if (batchResults && batchResults.length > 0) {
        batchedResults.push(...batchResults);
      }
    } catch {
      // Continue with next batch instead of failing completely
    }
  }
  return batchedResults;
};

export const fetchMetabase = async (codes: any, language: string): Promise<Capacity[]> => {
  try {
    if (!codes || codes.length === 0) {
      return [];
    }

    // Keep only codes that carry a valid wd_code
    const validCodes = codes.filter(
      (code: any) => code.wd_code && typeof code.wd_code === 'string'
    );
    if (validCodes.length === 0) {
      return [];
    }
    codes = validCodes;

    // Handle large requests by batching to avoid URL length limits
    const BATCH_SIZE = 20; // Limit batch size to prevent URL length issues
    if (codes.length > BATCH_SIZE) {
      return await fetchMetabaseInBatches(codes, language, BATCH_SIZE);
    }

    const mbQueryText = `PREFIX wbt:<https://metabase.wikibase.cloud/prop/direct/>
      PREFIX wb: <https://metabase.wikibase.cloud/entity/>
      SELECT ?item ?itemLabel ?itemDescription ?value WHERE {
      VALUES ?value {${codes.map((code: any) => `"${code.wd_code}"`).join(' ')}}
      ?item wbt:P5 wb:Q34531.
      ?item wbt:P67/wbt:P1 ?value.
      SERVICE wikibase:label { bd:serviceParam wikibase:language '${language},en'. }}`;

    // Use environment-specific URL for server-side requests
    const baseUrl = getApiBaseUrl();
    const response = await axios.get(`${baseUrl}/api/metabase-sparql`, {
      params: {
        format: 'json',
        query: mbQueryText,
      },
    });

    // Check if response has expected structure
    if (!response.data || !response.data.results || !response.data.results.bindings) {
      return [];
    }

    // Process the raw results to a consistent format
    return (response.data.results.bindings || [])
      .filter(isMetabaseBindingValid)
      .map((mbItem: any) => mapMetabaseBinding(mbItem, codes, language));
  } catch {
    // Silently handle errors

    return [];
  }
};

export const sanitizeCapacityName = (name: string | undefined, code: string | number): string => {
  if (isInvalidCapacityLabel(name)) {
    return `Capacity ${code}`;
  }
  return name!.trim();
};

/** Replaces Metabase URI/QID labels with Wikidata labels when available. */
export const applyWikidataNameFallback = async (
  results: Array<{ wd_code: string; name: string; code?: number; [key: string]: unknown }>,
  language: string
) => {
  const needingNames = results.filter(r => isInvalidCapacityLabel(r.name));
  if (needingNames.length === 0) {
    return results;
  }

  try {
    const codes = needingNames.map(r => ({ code: r.code, wd_code: r.wd_code }));

    // Prefer Action API proxy (reliable labels); SPARQL often returns entity URIs
    const apiLabels = await fetchWikidataLabelsViaApi(codes, language);

    return results.map(r => {
      if (!isInvalidCapacityLabel(r.name)) {
        return r;
      }

      const apiMatch = apiLabels.find(a => a.wd_code?.toUpperCase() === r.wd_code?.toUpperCase());
      if (apiMatch && !isInvalidCapacityLabel(apiMatch.name)) {
        return { ...r, name: apiMatch.name, code: r.code ?? apiMatch.code };
      }

      return {
        ...r,
        name: sanitizeCapacityName(r.name, r.code ?? 0),
        code: r.code,
      };
    });
  } catch {
    return results.map(r =>
      isInvalidCapacityLabel(r.name)
        ? { ...r, name: sanitizeCapacityName(r.name, r.code ?? r.wd_code) }
        : r
    );
  }
};

// =============================================================================
// FILTER AND LIST OPERATIONS
// Functions for handling capacity operations in filters and lists
// =============================================================================

/**
 * Adds unique capacities to an existing array, avoiding duplicates
 * Used specifically for filter operations where we need {code, name} objects
 */
export function addUniqueCapacities(
  existingCapacities: CapacityItem[],
  newCapacities: Capacity[]
): CapacityItem[] {
  const result = [...existingCapacities];

  newCapacities.forEach(capacity => {
    const capacityExists = result.some(cap => cap.code === capacity.code);
    if (!capacityExists) {
      result.push({
        code: capacity.code,
        name: capacity.name,
      });
    }
  });

  return result;
}

/**
 * Ensures that a value is an array
 */
export function ensureArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Sanitizes a capacity code to ensure it's a number
 */
export function sanitizeCapacityCode(code: number | string): number {
  return typeof code === 'string' ? parseInt(code, 10) : code;
}
