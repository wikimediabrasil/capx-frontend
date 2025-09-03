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
    // Always try Metabase first as it has metabase_code
    const formattedCodes = codes.map(code => ({
      ...code,
      code: typeof code.code === 'string' ? parseInt(code.code, 10) : code.code,
    }));

    let metabaseResults: any[] = [];
    let wikidataResults: any[] = [];
    
    // Try Metabase first
    try {
      metabaseResults = await fetchMetabase(formattedCodes, language) || [];
      console.log(`📋 Metabase returned ${metabaseResults.length} results`);
    } catch (metabaseError) {
      console.warn('⚠️ Metabase failed, continuing with Wikidata only:', metabaseError);
    }

    // If Metabase gave us results, return them (they have metabase_code)
    if (metabaseResults.length > 0) {
      return metabaseResults;
    }

    // If no results from Metabase, try Wikidata but add empty metabase_code
    try {
      wikidataResults = await fetchWikidata(codes, language) || [];
      console.log(`📋 Wikidata returned ${wikidataResults.length} results`);
      
      // Add empty metabase_code to Wikidata results
      wikidataResults = wikidataResults.map(result => ({
        ...result,
        metabase_code: '' // Wikidata doesn't have metabase_code
      }));
    } catch (wikidataError) {
      console.warn('⚠️ Wikidata also failed:', wikidataError);
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
  const codeStr = code.toString();
  
  const iconMap: Record<string, string> = {
    '10': OrganizationalIcon,
    '36': CommunicationIcon,
    '50': LearningIcon,
    '56': CommunityIcon,
    '65': SocialIcon,
    '74': StrategicIcon,
    '106': TechnologyIcon,
  };

  // Check for prefix matches
  if (codeStr.startsWith('10')) return iconMap['10'];
  if (codeStr.startsWith('36')) return iconMap['36'];
  if (codeStr.startsWith('50')) return iconMap['50'];
  if (codeStr.startsWith('56')) return iconMap['56'];
  if (codeStr.startsWith('65')) return iconMap['65'];
  if (codeStr.startsWith('74')) return iconMap['74'];
  if (codeStr.startsWith('106')) return iconMap['106'];

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

export const fetchWikidata = async (codes: any, language: string) => {
  try {
    if (!codes || codes.length === 0 || !codes[0].wd_code) {
      console.warn('⚠️ fetchWikidata: No valid codes provided');
      return [];
    }

    // Continue with Wikidata query...
    const wdCodeList = codes.map((code: any) => 'wd:' + code.wd_code);
    const queryText = `SELECT ?item ?itemLabel ?itemDescription WHERE {VALUES ?item {${wdCodeList.join(
      ' '
    )}} SERVICE wikibase:label { bd:serviceParam wikibase:language '${language},en'.}}`;

    const wikidataResponse = await axios.get(
      `https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=${queryText}`
    );

    const results = (wikidataResponse.data.results.bindings || [])
      .filter(
        (wdItem: any) =>
          wdItem.item && wdItem.item.value && wdItem.itemLabel && wdItem.itemLabel.value
      )
      .map((wdItem: any) => ({
        wd_code: wdItem.item.value.split('/').slice(-1)[0],
        name: wdItem.itemLabel.value,
        description: wdItem.itemDescription?.value || '',
      }));

    return results;
  } catch (error) {
    console.error('❌ Error in fetchWikidata:', error);
    return [];
  }
};

export const fetchMetabase = async (codes: any, language: string): Promise<Capacity[]> => {
  try {
    if (!codes || codes.length === 0) {
      console.warn('⚠️ fetchMetabase: No codes provided');
      return [];
    }

    // Validate all codes have wd_code
    const invalidCodes = codes.filter(
      (code: any) => !code.wd_code || typeof code.wd_code !== 'string'
    );
    if (invalidCodes.length > 0) {
      console.warn('⚠️ fetchMetabase: Found codes without wd_code:', {
        invalidCount: invalidCodes.length,
        totalCount: codes.length,
        invalidCodes: invalidCodes.slice(0, 3),
        validCodes: codes.filter((code: any) => code.wd_code).slice(0, 3),
      });

      // Filter out invalid codes and continue with valid ones
      const validCodes = codes.filter(
        (code: any) => code.wd_code && typeof code.wd_code === 'string'
      );
      if (validCodes.length === 0) {
        console.warn('⚠️ fetchMetabase: No valid codes with wd_code found');
        return [];
      }
      codes = validCodes; // Update codes to only valid ones
    }

    // Handle large requests by batching to avoid URL length limits
    const BATCH_SIZE = 20; // Limit batch size to prevent URL length issues

    if (codes.length > BATCH_SIZE) {
      console.log(
        `🔄 fetchMetabase: Large request (${codes.length} codes), splitting into batches`
      );

      const batchedResults = [];
      for (let i = 0; i < codes.length; i += BATCH_SIZE) {
        const batch = codes.slice(i, i + BATCH_SIZE);
        console.log(
          `📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(codes.length / BATCH_SIZE)} (${batch.length} codes)`
        );

        try {
          const batchResults = await fetchMetabase(batch, language);
          if (batchResults && batchResults.length > 0) {
            batchedResults.push(...batchResults);
          }
        } catch (error) {
          console.error(`❌ Error in batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
          // Continue with next batch instead of failing completely
        }
      }

      console.log(
        `✅ fetchMetabase batching completed: ${batchedResults.length} total results from ${codes.length} codes`
      );
      return batchedResults;
    }

    const mbQueryText = `PREFIX wbt:<https://metabase.wikibase.cloud/prop/direct/>
      SELECT ?item ?itemLabel ?itemDescription ?value WHERE {
      VALUES ?value {${codes.map((code: any) => `"${code.wd_code}"`).join(' ')}}
      ?item wbt:P1 ?value.
      SERVICE wikibase:label { bd:serviceParam wikibase:language '${language},en'. }}`;

    console.log('🔍 fetchMetabase debug info:', {
      language,
      codesCount: codes.length,
      sampleCodes: codes.slice(0, 3),
      queryLength: mbQueryText.length,
      queryLanguageParam: `'${language},en'`,
    });

    try {
      // Use absolute URL for server-side requests
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const response = await axios.get(`${baseUrl}/api/metabase-sparql`, {
        params: {
          format: 'json',
          query: mbQueryText,
        },
      });

      console.log('✅ fetchMetabase request successful:', {
        status: response.status,
        language,
        codesCount: codes.length,
      });

      // Log the response for debugging
      console.log('🔍 Metabase response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        data_type: typeof response.data,
        has_results: !!response.data?.results,
        has_bindings: !!response.data?.results?.bindings,
      });

      // Check if response has expected structure
      if (!response.data || !response.data.results || !response.data.results.bindings) {
        console.warn('⚠️ Unexpected Metabase response structure:', response.data);
        return [];
      }

      // Process the raw results to a consistent format
      const results = (response.data.results.bindings || [])
        .filter(
          (mbItem: any) =>
            mbItem.item &&
            mbItem.item.value &&
            mbItem.itemLabel &&
            mbItem.itemLabel.value &&
            mbItem.value
        )
        .map((mbItem: any) => {
          // Extract the Metabase ID from the item URI
          const itemUri = mbItem.item.value;
          const metabaseCode = itemUri.split('/').slice(-1)[0];

          const result = {
            wd_code: mbItem.value.value,
            name: mbItem.itemLabel.value,
            description: mbItem.itemDescription?.value || '',
            item: mbItem.item.value,
            metabase_code: metabaseCode,
          };

          // Log each result to debug description processing
          console.log('🔍 Processing Metabase item:', {
            wd_code: result.wd_code,
            name: result.name,
            hasDescription: !!result.description,
            descriptionLength: result.description?.length || 0,
            descriptionPreview: result.description?.substring(0, 50) || 'No description',
            requestedLanguage: language,
          });

          return result;
        });

      // If we requested a non-English language but got English results, return empty to trigger Wikidata fallback
      if (language !== 'en' && results.length > 0) {
        const hasEnglishResults = results.some(result => {
          // Check if the name looks like it's in English (common English terms)
          const englishTerms = [
            'communication',
            'learning',
            'technology',
            'social',
            'strategic',
            'organizational',
            'community',
          ];
          return englishTerms.some(term => result.name.toLowerCase().includes(term));
        });

        if (hasEnglishResults) {
          console.log(
            `⚠️ Metabase returned English results for ${language} request, forcing Wikidata fallback`
          );
          return []; // Return empty to trigger Wikidata fallback
        }
      }

      return results;
    } catch (requestError) {
      console.error('❌ Error making request to fetchMetabase:', requestError);
      console.error('Request details:', {
        language,
        codesCount: codes.length,
        sampleCodes: codes.slice(0, 3),
        errorMessage: (requestError as Error).message,
      });
      throw requestError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('❌ Error in fetchMetabase:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      language,
      codesCount: codes?.length || 0,
    });

    // Specific handling for "Invalid URL" error
    if ((error as Error).message.includes('Invalid URL')) {
      console.error('🔍 Invalid URL error details:', {
        language,
        codes: codes?.slice(0, 5), // Log first 5 codes for debugging
        errorMessage: (error as Error).message,
      });
    }

    return [];
  }
};

export const sanitizeCapacityName = (name: string | undefined, code: string | number): string => {
  // Case where the name is not defined or is empty
  if (!name || name.trim() === '') {
    return `Capacity ${code}`;
  }

  // Check if the name looks like a QID (common format with Q followed by numbers)
  if (name.startsWith('Q') && /^Q\d+$/.test(name)) {
    return `Capacity ${code}`;
  }

  return name;
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
