import { Event } from '@/types/event';

const METABASE_ENDPOINT = 'https://metabase.wikibase.cloud/query/sparql';

/**
 * Service for SPARQL queries to the Metabase of Wikibase Cloud
 */

export async function fetchEventDataByQID(qid: string): Promise<Partial<Event> | null> {
  if (!qid || !qid.startsWith('Q')) {
    console.error('Invalid QID:', qid);
    return null;
  }

  const query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX schema: <http://schema.org/>
    
    SELECT ?name ?description ?image_url ?start_date ?end_date ?location ?location_name ?url WHERE {
      wd:${qid} rdfs:label ?name .
      FILTER(LANG(?name) = "pt" || LANG(?name) = "en")
      
      OPTIONAL { wd:${qid} schema:description ?description . 
                FILTER(LANG(?description) = "pt" || LANG(?description) = "en") }
      
      OPTIONAL { wd:${qid} wdt:P18 ?image . 
                BIND(CONCAT("https://commons.wikimedia.org/wiki/Special:FilePath/", ?image) AS ?image_url) }
      
      OPTIONAL { wd:${qid} wdt:P580 ?start_date . }
      OPTIONAL { wd:${qid} wdt:P582 ?end_date . }
      
      OPTIONAL { 
        wd:${qid} wdt:P276 ?location . 
        ?location rdfs:label ?location_name .
        FILTER(LANG(?location_name) = "pt" || LANG(?location_name) = "en")
      }
      
      OPTIONAL { wd:${qid} wdt:P856 ?url . }
    }
    LIMIT 1
  `;

  try {
    // Encode the query for use in URL
    const encodedQuery = encodeURIComponent(query);

    // Make the request to the SPARQL endpoint
    const response = await fetch(`${METABASE_ENDPOINT}?format=json&query=${encodedQuery}`);

    if (!response.ok) {
      throw new Error(`Error in request: ${response.status}`);
    }

    const data = await response.json();

    // If there are no results, return null
    if (!data.results || !data.results.bindings || data.results.bindings.length === 0) {
      return null;
    }

    const result = data.results.bindings[0];

    // Build the event object with the obtained data
    const eventData: Partial<Event> = {
      name: result.name?.value || '',
      wikidata_qid: qid,
      description: result.description?.value || '',
      image_url: result.image_url?.value || '',
      url: result.url?.value || '',
    };

    // Process dates if available
    if (result.start_date?.value) {
      try {
        eventData.time_begin = new Date(result.start_date.value).toISOString();
      } catch (error) {
        console.error(
          '❌ fetchEventDataByQID - Error processing start_date:',
          result.start_date.value,
          error
        );
        eventData.time_begin = undefined;
      }
    }

    if (result.end_date?.value) {
      try {
        eventData.time_end = new Date(result.end_date.value).toISOString();
      } catch (error) {
        console.error(
          '❌ fetchEventDataByQID - Error processing end_date:',
          result.end_date.value,
          error
        );
        eventData.time_end = undefined;
      }
    }

    // If we have a location, define the type as in-person
    if (result.location?.value) {
      eventData.type_of_location = 'in-person';

      // If it has an OpenStreetMap ID, add it here
      // Note: This requires an additional query or a specific property
    }

    return eventData;
  } catch (error) {
    console.error('Error fetching event data from Metabase:', error);
    return null;
  }
}

export function extractYearFromText(text: string): number | undefined {
  if (!text) return undefined;

  // Search for year patterns (2020-2030)
  const yearMatch = text.match(/\b(202[0-9]|203[0-9])\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    return year;
  }

  return undefined;
}

export function extractDatesFromPageContent(
  pageContent: string
): { time_begin: string; time_end?: string } | undefined {
  if (!pageContent) return undefined;

  // Enhanced patterns for different date formats, including Portuguese
  const patterns = [
    // Portuguese formats: "19 e 20 de julho de 2025", "19 a 20 de julho de 2025"
    /(\d{1,2})\s+(?:e|a)\s+(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/gi,
    /(\d{1,2})\s+(?:e|a)\s+(\d{1,2})\s+de\s+(\w+)/gi,

    // Portuguese with month names: "julho de 2025"
    /(\w+)\s+de\s+(\d{4})/gi,

    // Month names with ranges: "July 19-20, 2025", "19-20 July 2025", "July 19 to July 20, 2025"
    /(\w+)\s+(\d{1,2})\s*(?:to|até|a|-|–)\s*(\d{1,2}),?\s*(\d{4})/gi,
    /(\d{1,2})\s*(?:to|até|a|-|–)\s*(\d{1,2})\s+(\w+)\s+(\d{4})/gi,
    /(\w+)\s+(\d{1,2})\s+to\s+(\w+)\s+(\d{1,2}),?\s*(\d{4})/gi,

    // Full month names: "July 19, 2025 to July 20, 2025"
    /(\w+)\s+(\d{1,2}),?\s*(\d{4})\s*(?:to|até|a|-|–)\s*(\w+)\s+(\d{1,2}),?\s*(\d{4})/gi,

    // ISO format: "2025-07-19" to "2025-07-20", "2025-07-19 - 2025-07-20"
    /(\d{4})-(\d{1,2})-(\d{1,2})\s*(?:to|até|a|-|–)\s*(\d{4})-(\d{1,2})-(\d{1,2})/gi,

    // Numeric format with separators: "19/07/2025 - 20/07/2025", "19.07.2025 to 20.07.2025"
    /(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})\s*(?:to|até|a|-|–)\s*(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})/gi,

    // American format: "07/19/2025 - 07/20/2025", "07-19-2025 to 07-20-2025"
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s*(?:to|até|a|-|–)\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/gi,

    // Consecutive dates: "19-20/07/2025", "19-20.07.2025", "19-20/07/25"
    /(\d{1,2})-(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{2,4})/gi,

    // Simple format with year: "19-20 2025", "19 to 20 2025"
    /(\d{1,2})\s*(?:to|até|a|-|–)\s*(\d{1,2})\s+(\d{4})/gi,

    // Single month name: "July 19, 2025", "19 July 2025"
    /(\w+)\s+(\d{1,2}),?\s*(\d{4})/gi,
    /(\d{1,2})\s+(\w+)\s+(\d{4})/gi,

    // Single ISO date: "2025-07-19"
    /(\d{4})-(\d{1,2})-(\d{1,2})/gi,

    // Single numeric date: "19/07/2025", "19.07.2025"
    /(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})/gi,

    // Single American date: "07/19/2025", "07-19-2025"
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/gi,
  ];

  // Month name to number mapping (English and Portuguese)
  const monthMap: Record<string, string> = {
    // English
    january: '01',
    jan: '01',
    february: '02',
    feb: '02',
    march: '03',
    mar: '03',
    april: '04',
    apr: '04',
    may: '05',
    june: '06',
    jun: '06',
    july: '07',
    jul: '07',
    august: '08',
    aug: '08',
    september: '09',
    sep: '09',
    sept: '09',
    october: '10',
    oct: '10',
    november: '11',
    nov: '11',
    december: '12',
    dec: '12',

    // Portuguese
    janeiro: '01',
    fevereiro: '02',
    fev: '02',
    março: '03',
    abril: '04',
    abr: '04',
    maio: '05',
    mai: '05',
    junho: '06',
    julho: '07',
    agosto: '08',
    ago: '08',
    setembro: '09',
    set: '09',
    outubro: '10',
    out: '10',
    novembro: '11',
    dezembro: '12',
    dez: '12',
  };

  // Helper function to convert month name to number
  const getMonthNumber = (monthName: string): string | null => {
    const month = monthName.toLowerCase();
    return monthMap[month] || null;
  };

  // Try each pattern
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const matches = Array.from(pageContent.matchAll(pattern));

    for (const match of matches) {
      try {
        let startYear: string = '';
        let startMonth: string = '';
        let startDay: string = '';
        let endYear: string = '';
        let endMonth: string = '';
        let endDay: string = '';

        if (i === 0) {
          // Pattern 1: "19 e 20 de julho de 2025" (portuguese)
          const [, startDayStr, endDayStr, monthName, yearStr] = match;
          const monthNum = getMonthNumber(monthName);
          if (monthNum) {
            startMonth = endMonth = monthNum;
            startDay = startDayStr;
            endDay = endDayStr;
            startYear = endYear = yearStr;
          }
        } else if (i === 1) {
          // Pattern 2: "19 e 20 de julho" (portuguese without year)
          const [, startDayStr, endDayStr, monthName] = match;
          const monthNum = getMonthNumber(monthName);
          if (monthNum) {
            startMonth = endMonth = monthNum;
            startDay = startDayStr;
            endDay = endDayStr;
            // Assume current year if not specified
            const currentYear = new Date().getFullYear();
            startYear = endYear = currentYear.toString();
          }
        } else if (i === 2) {
          // Pattern 3: "julho de 2025" (portuguese single month)
          const [, monthName, yearStr] = match;
          const monthNum = getMonthNumber(monthName);
          if (monthNum) {
            startMonth = endMonth = monthNum;
            startDay = endDay = '01';
            startYear = endYear = yearStr;
          }
        } else if (i === 3) {
          // Pattern 4: "July 19-20, 2025"
          const [, monthName, startDayStr, endDayStr, yearStr] = match;
          const monthNum = getMonthNumber(monthName);
          if (monthNum) {
            startMonth = endMonth = monthNum;
            startDay = startDayStr;
            endDay = endDayStr;
            startYear = endYear = yearStr;
          }
        } else if (i === 4) {
          // Pattern 5: "19-20 July 2025"
          const [, startDayStr, endDayStr, monthName, yearStr] = match;
          const monthNum = getMonthNumber(monthName);
          if (monthNum) {
            startMonth = endMonth = monthNum;
            startDay = startDayStr;
            endDay = endDayStr;
            startYear = endYear = yearStr;
          }
        } else if (i === 5) {
          // Pattern 6: "July 19 to August 20, 2025"
          const [, startMonthName, startDayStr, endMonthName, endDayStr, yearStr] = match;
          const startMonthNum = getMonthNumber(startMonthName);
          const endMonthNum = getMonthNumber(endMonthName);
          if (startMonthNum && endMonthNum) {
            startMonth = startMonthNum;
            endMonth = endMonthNum;
            startDay = startDayStr;
            endDay = endDayStr;
            startYear = endYear = yearStr;
          }
        } else if (i === 6) {
          // Pattern 7: "July 19, 2025 to August 20, 2025"
          const [, startMonthName, startDayStr, startYearStr, endMonthName, endDayStr, endYearStr] =
            match;
          const startMonthNum = getMonthNumber(startMonthName);
          const endMonthNum = getMonthNumber(endMonthName);
          if (startMonthNum && endMonthNum) {
            startMonth = startMonthNum;
            endMonth = endMonthNum;
            startDay = startDayStr;
            endDay = endDayStr;
            startYear = startYearStr;
            endYear = endYearStr;
          }
        } else if (i === 7) {
          // Pattern 8: ISO "YYYY-MM-DD to YYYY-MM-DD"
          [, startYear, startMonth, startDay, endYear, endMonth, endDay] = match;
        } else if (i === 8) {
          // Pattern 9: "DD/MM/YYYY to DD/MM/YYYY" (european format)
          [, startDay, startMonth, startYear, endDay, endMonth, endYear] = match;
        } else if (i === 9) {
          // Pattern 10: "MM/DD/YYYY to MM/DD/YYYY" (american format)
          [, startMonth, startDay, startYear, endMonth, endDay, endYear] = match;
        } else if (i === 10) {
          // Pattern 11: "DD-DD/MM/YYYY" (consecutive days)
          [, startDay, endDay, startMonth, startYear] = match;
          endYear = startYear;
          endMonth = startMonth;

          // Convert 2-digit year to 4-digit year if necessary
          if (startYear.length === 2) {
            const year = parseInt(startYear);
            startYear = endYear = year > 50 ? `19${year}` : `20${year}`;
          }
        } else if (i === 11) {
          // Pattern 12: "DD to DD YYYY" (simple format)
          [, startDay, endDay, startYear] = match;
          endYear = startYear;
          // Assume current month or January if not specified
          startMonth = endMonth = '01';
        } else if (i === 12) {
          // Pattern 13: "July 19, 2025" (single month name)
          const [, monthName, dayStr, yearStr] = match;
          const monthNum = getMonthNumber(monthName);
          if (monthNum) {
            startMonth = endMonth = monthNum;
            startDay = endDay = dayStr;
            startYear = endYear = yearStr;
          }
        } else if (i === 13) {
          // Pattern 14: "19 July 2025" (day month year)
          const [, dayStr, monthName, yearStr] = match;
          const monthNum = getMonthNumber(monthName);
          if (monthNum) {
            startMonth = endMonth = monthNum;
            startDay = endDay = dayStr;
            startYear = endYear = yearStr;
          }
        } else if (i === 14) {
          // Pattern 15: "YYYY-MM-DD" (ISO single)
          [, startYear, startMonth, startDay] = match;
          endYear = startYear;
          endMonth = startMonth;
          endDay = startDay;
        } else if (i === 15) {
          // Pattern 16: "DD/MM/YYYY" (european single)
          [, startDay, startMonth, startYear] = match;
          endYear = startYear;
          endMonth = startMonth;
          endDay = startDay;
        } else if (i === 16) {
          // Pattern 17: "MM/DD/YYYY" (american single)
          [, startMonth, startDay, startYear] = match;
          endYear = startYear;
          endMonth = startMonth;
          endDay = startDay;
        }

        // Check if we have all required components
        if (startYear && startMonth && startDay && endYear && endMonth && endDay) {
          // Check if the values are valid
          const startYearNum = parseInt(startYear);
          const startMonthNum = parseInt(startMonth);
          const startDayNum = parseInt(startDay);
          const endYearNum = parseInt(endYear);
          const endMonthNum = parseInt(endMonth);
          const endDayNum = parseInt(endDay);

          // Basic validity checks
          if (
            startYearNum >= 2020 &&
            startYearNum <= 2030 &&
            startMonthNum >= 1 &&
            startMonthNum <= 12 &&
            startDayNum >= 1 &&
            startDayNum <= 31 &&
            endYearNum >= 2020 &&
            endYearNum <= 2030 &&
            endMonthNum >= 1 &&
            endMonthNum <= 12 &&
            endDayNum >= 1 &&
            endDayNum <= 31
          ) {
            const startDate = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}T00:00:00.000Z`;
            const endDate = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}T23:59:59.000Z`;

            return {
              time_begin: startDate,
              time_end: endDate,
            };
          }
        }
      } catch (error) {
        console.error('❌ Error processing date match:', error, match);
        continue;
      }
    }
  }

  // Fallback: try to extract at least the year and create default dates
  const yearMatch = pageContent.match(/\b(202[0-9]|203[0-9])\b/);
  if (yearMatch) {
    const year = yearMatch[1];

    return {
      time_begin: `${year}-01-01T00:00:00.000Z`,
      time_end: `${year}-12-31T23:59:59.000Z`,
    };
  }

  return undefined;
}

export function extractWikimediaTitleFromURL(url: string): string | undefined {
  if (!url) return undefined;

  try {
    // URL patterns for Wikimedia
    const patterns = [
      /wikimedia\.org\/wiki\/([^/#?]+)/i,
      /wikipedia\.org\/wiki\/([^/#?]+)/i,
      /meta\.wikimedia\.org\/wiki\/([^/#?]+)/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        // Decode the URL title (to handle special characters)
        return decodeURIComponent(match[1].replace(/_/g, ' '));
      }
    }

    return undefined;
  } catch (error) {
    console.error('Error extracting title from URL:', error);
    return undefined;
  }
}

export function extractQIDFromURL(url: string): string | undefined {
  if (!url) return undefined;

  try {
    // URL patterns for Wikidata
    const patterns = [/wikidata\.org\/wiki\/(Q\d+)/i, /wikidata\.org\/entity\/(Q\d+)/i, /(Q\d+)$/i];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return undefined;
  } catch (error) {
    console.error('Error extracting QID from URL:', error);
    return undefined;
  }
}

export async function fetchEventDataByURL(url: string): Promise<Partial<Event> | null> {
  const qid = extractQIDFromURL(url);
  if (!qid) {
    console.error('Unable to extract QID from URL:', url);
    return null;
  }

  return fetchEventDataByQID(qid);
}

export async function fetchLocationByOSMId(osmId: string): Promise<any | null> {
  if (!osmId) return null;

  const query = `
    PREFIX osm: <https://www.openstreetmap.org/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?name ?lat ?lon ?address WHERE {
      osm:${osmId} rdfs:label ?name ;
                   wdt:P625 ?coordinates .
      
      BIND(CONCAT(STR(?lat), ",", STR(?lon)) AS ?coordinates)
      
      OPTIONAL { osm:${osmId} wdt:P969 ?address . }
    }
    LIMIT 1
  `;

  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${METABASE_ENDPOINT}?format=json&query=${encodedQuery}`);

    if (!response.ok) {
      throw new Error(`Error in request: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || !data.results.bindings || data.results.bindings.length === 0) {
      return null;
    }

    return data.results.bindings[0];
  } catch (error) {
    console.error('Error fetching location data from Metabase:', error);
    return null;
  }
}

/**
 * Fetches comprehensive data from a Wikimedia page using multiple APIs
 */

async function fetchWikimediaPageData(url: string): Promise<{
  content?: string;
  wikidata_qid?: string;
  infobox?: any;
  categories?: string[];
} | null> {
  try {
    // Extract domain and page title from URL
    const urlMatch = url.match(/https?:\/\/([^\/]+)\/wiki\/(.+)/i);
    if (!urlMatch) return null;

    const [, domain, pageTitle] = urlMatch;
    const cleanTitle = pageTitle.replace(/_/g, ' ');

    // Multiple API calls to get comprehensive data
    const [contentData, wikidataData, infoboxData] = await Promise.allSettled([
      // 1. Get page content
      fetch(
        `https://${domain}/w/api.php?action=query&format=json&titles=${encodeURIComponent(cleanTitle)}&prop=extracts&explaintext=true&exsectionformat=plain&origin=*`
      ),

      // 2. Get Wikidata QID if available
      fetch(
        `https://${domain}/w/api.php?action=query&format=json&titles=${encodeURIComponent(cleanTitle)}&prop=pageprops&origin=*`
      ),

      // 3. Get page with wikitext to extract infobox
      fetch(
        `https://${domain}/w/api.php?action=query&format=json&titles=${encodeURIComponent(cleanTitle)}&prop=revisions&rvprop=content&origin=*`
      ),
    ]);

    let content: string | undefined = undefined;
    let wikidata_qid: string | undefined = undefined;
    let infobox = null;
    let categories = [];

    // Process content
    if (contentData.status === 'fulfilled' && contentData.value.ok) {
      const data = await contentData.value.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        content = pages[pageId]?.extract || null;
      }
    }

    // Process Wikidata QID
    if (wikidataData.status === 'fulfilled' && wikidataData.value.ok) {
      const data = await wikidataData.value.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const pageprops = pages[pageId]?.pageprops;
        wikidata_qid = pageprops?.wikibase_item || null;
      }
    }

    // Process infobox data
    if (infoboxData.status === 'fulfilled' && infoboxData.value.ok) {
      const data = await infoboxData.value.json();
      const pages = data.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const wikitext = pages[pageId]?.revisions?.[0]?.['*'];
        if (wikitext) {
          infobox = extractInfoboxFromWikitext(wikitext);
        }
      }
    }

    return {
      content,
      wikidata_qid,
      infobox,
      categories,
    };
  } catch (error) {
    console.error('Error fetching Wikimedia page data:', error);
    return null;
  }
}

/**
 * Extracts infobox data from wikitext
 */
function extractInfoboxFromWikitext(wikitext: string): any {
  if (!wikitext) return null;

  try {
    const data: any = {};

    // First try to find infobox
    const infoboxMatch = wikitext.match(/\{\{[Ii]nfobox[\s\S]*?\}\}/g);
    if (infoboxMatch) {
      const infoboxText = infoboxMatch[0];

      // Extract common date fields from infobox
      const datePatterns = [
        { key: 'date', regex: /\|\s*date\s*=\s*([^|\n]+)/i },
        { key: 'dates', regex: /\|\s*dates\s*=\s*([^|\n]+)/i },
        { key: 'start_date', regex: /\|\s*start[_\s]*date\s*=\s*([^|\n]+)/i },
        { key: 'end_date', regex: /\|\s*end[_\s]*date\s*=\s*([^|\n]+)/i },
        { key: 'when', regex: /\|\s*when\s*=\s*([^|\n]+)/i },
        { key: 'time', regex: /\|\s*time\s*=\s*([^|\n]+)/i },
      ];

      for (const pattern of datePatterns) {
        const match = infoboxText.match(pattern.regex);
        if (match && match[1]) {
          data[pattern.key] = match[1].trim();
        }
      }

      // Extract location from infobox
      const locationMatch = infoboxText.match(/\|\s*location\s*=\s*([^|\n]+)/i);
      if (locationMatch && locationMatch[1]) {
        data.location = locationMatch[1].trim();
      }

      // Extract description/summary from infobox
      const summaryMatch = infoboxText.match(/\|\s*(summary|description)\s*=\s*([^|\n]+)/i);
      if (summaryMatch && summaryMatch[2]) {
        data.description = summaryMatch[2].trim();
      }
    }

    // If no infobox or missing data, try to extract from the main content
    if (!data.date && !data.dates && !data.when) {
      // Look for date patterns in the main content
      const datePatterns = [
        // "19 e 20 de julho de 2025"
        /(\d{1,2})\s+e\s+(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/gi,
        // "19 e 20 de julho"
        /(\d{1,2})\s+e\s+(\d{1,2})\s+de\s+(\w+)/gi,
        // "19-20 de julho de 2025"
        /(\d{1,2})-(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/gi,
        // "19 a 20 de julho de 2025"
        /(\d{1,2})\s+a\s+(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/gi,
        // "julho de 2025"
        /(\w+)\s+de\s+(\d{4})/gi,
      ];

      for (const pattern of datePatterns) {
        const match = wikitext.match(pattern);
        if (match) {
          data.dates = match[0];
          break;
        }
      }
    }

    // Extract location from content if not found in infobox
    if (!data.location) {
      const locationPatterns = [
        /\*\*Local\*\*:\s*([^|\n]+)/i,
        /Local:\s*([^|\n]+)/i,
        /em\s+([^,]+),\s+([^|\n]+)/i,
      ];

      for (const pattern of locationPatterns) {
        const match = wikitext.match(pattern);
        if (match && match[1]) {
          data.location = match[1].trim();
          break;
        }
      }
    }

    // Extract description from content if not found in infobox
    if (!data.description) {
      // Look for the first substantial paragraph that describes the event
      const paragraphs = wikitext.split('\n').filter(p => p.trim().length > 50);
      for (const paragraph of paragraphs) {
        // Skip paragraphs that are just navigation or technical info
        if (
          !paragraph.includes('==') &&
          !paragraph.includes('{{') &&
          !paragraph.includes('[[') &&
          !paragraph.includes('*') &&
          paragraph.length > 100
        ) {
          data.description = paragraph.trim();
          break;
        }
      }
    }

    return Object.keys(data).length > 0 ? data : null;
  } catch (error) {
    console.error('Error extracting infobox:', error);
    return null;
  }
}

/**
 * Extracts description from page content (first paragraph)
 */
function extractDescriptionFromContent(content: string): string {
  if (!content) return '';

  // Split by paragraphs and get the first substantial one
  const paragraphs = content.split('\n').filter(p => p.trim().length > 50);

  if (paragraphs.length > 0) {
    // Return first paragraph, limited to reasonable length
    const firstParagraph = paragraphs[0].trim();
    return firstParagraph.length > 300 ? firstParagraph.substring(0, 300) + '...' : firstParagraph;
  }

  return '';
}

export async function fetchEventDataByWikimediaURL(url: string): Promise<Partial<Event> | null> {
  const pageTitle = extractWikimediaTitleFromURL(url);

  if (!pageTitle) {
    console.error('Unable to extract the page title from the URL:', url);
    return null;
  }

  try {
    // Fetch comprehensive page data
    const pageData = await fetchWikimediaPageData(url);

    // If we found a Wikidata QID, use the SPARQL endpoint for structured data
    if (pageData?.wikidata_qid) {
      const wikidataResult = await fetchEventDataByQID(pageData.wikidata_qid);
      if (wikidataResult) {
        // Ensure the URL is set to the original Wikimedia URL
        wikidataResult.url = url;
        return wikidataResult;
      }
    }

    // Create basic data for events based on the page title
    const lowerPageTitle = pageTitle.toLowerCase();
    const extractedYear = extractYearFromText(pageTitle) || extractYearFromText(url);

    const eventData: Partial<Event> = {
      name: pageTitle,
      url: url,
    };

    // Try to extract dates from infobox first (more structured)
    if (pageData?.infobox) {
      // Extract description from infobox
      if (pageData.infobox.description) {
        eventData.description = pageData.infobox.description;
      }

      // Extract dates from infobox
      const infoboxDateText = [
        pageData.infobox.date,
        pageData.infobox.dates,
        pageData.infobox.start_date,
        pageData.infobox.end_date,
        pageData.infobox.when,
        pageData.infobox.time,
      ]
        .filter(Boolean)
        .join(' ');

      if (infoboxDateText) {
        const dateInfo = extractDatesFromPageContent(infoboxDateText);
        if (dateInfo) {
          eventData.time_begin = dateInfo.time_begin;
          if (dateInfo.time_end) {
            eventData.time_end = dateInfo.time_end;
          }
        }
      }

      // Set location type based on infobox location
      if (pageData.infobox.location) {
        eventData.type_of_location = 'in-person';
      }
    }

    // Fallback to page content if infobox didn't provide enough data
    if (pageData?.content && (!eventData.description || !eventData.time_begin)) {
      // Extract description from page content if not found in infobox
      if (!eventData.description) {
        const description = extractDescriptionFromContent(pageData.content);
        if (description) {
          eventData.description = description;
        }
      }

      // Try to extract dates from page content if not found in infobox
      if (!eventData.time_begin) {
        const dateInfo = extractDatesFromPageContent(pageData.content);
        if (dateInfo) {
          eventData.time_begin = dateInfo.time_begin;
          if (dateInfo.time_end) {
            eventData.time_end = dateInfo.time_end;
          }
        }
      }
    }

    if (extractedYear) {
      // Identify event type and define a cleaner name
      if (lowerPageTitle.includes('wikicon')) {
        eventData.name = `WikiCon Brasil ${extractedYear}`;
        if (!eventData.type_of_location) {
          eventData.type_of_location = 'hybrid';
        }
      } else if (lowerPageTitle.includes('wikimania')) {
        eventData.name = `Wikimania ${extractedYear}`;
        if (!eventData.type_of_location) {
          eventData.type_of_location = 'in-person';
        }
      } else {
        if (!eventData.type_of_location) {
          eventData.type_of_location = 'hybrid';
        }
      }
    }

    return eventData;
  } catch (error) {
    console.error('Error fetching event data from Wikimedia:', error);

    // Fallback for known events
    const lowerPageTitle = pageTitle.toLowerCase();
    const extractedYear = extractYearFromText(pageTitle) || extractYearFromText(url);

    // Wikicon
    if (lowerPageTitle.includes('wikicon') && extractedYear) {
      return {
        name: `WikiCon Brasil ${extractedYear}`,
        description: '',
        time_begin: '',
        time_end: '',
        type_of_location: 'hybrid',
        url: url,
      };
    }

    // Fallback genérico para outros eventos com ano identificado
    if (extractedYear) {
      return {
        name: pageTitle,
        description: '',
        time_begin: '',
        time_end: '',
        type_of_location: 'hybrid',
        url: url,
      };
    }

    return null;
  }
}

/**
 * Fetches course information from WikiLearn page
 * Note: Due to CORS restrictions, we can't fetch the page content directly from the frontend.
 * Instead, we'll extract information from the URL and provide fallback data.
 */

async function fetchLearnWikiPageContent(
  url: string
): Promise<{ title?: string; description?: string; dates?: string } | null> {
  try {
    // Extract course code from URL
    const courseMatch = url.match(/course-v1:([^/]+)/i);
    if (!courseMatch || !courseMatch[1]) {
      return null;
    }

    const courseCode = decodeURIComponent(courseMatch[1]);
    const courseParts = courseCode.split('+');

    if (courseParts.length < 3) {
      return null;
    }

    const [organization, code, year] = courseParts;

    // Generate dynamic title and description based on URL components
    let title: string | undefined;
    let description: string | undefined;

    // Create title from course code and organization
    const orgName = organization.replace(/-/g, ' ');
    title = `${code} Course`;

    // Generate description based on available information
    description = `Online training course from ${orgName}.`;

    // Use year from URL as the date (no CORS issues)
    let dates: string | undefined;
    if (year) {
      dates = `${year}-01-01`;
    }

    return { title, description, dates };
  } catch (error) {
    console.error('Error processing learn.wiki URL:', error);
    return null;
  }
}

export async function fetchEventDataByLearnWikiURL(url: string): Promise<Partial<Event> | null> {
  if (!url || !url.includes('learn.wiki')) return null;

  try {
    // Extract course information from URL (no CORS issues)
    const pageData = await fetchLearnWikiPageContent(url);

    if (!pageData) {
      console.error('Unable to extract course information from URL:', url);
      return null;
    }

    const eventData: Partial<Event> = {
      name: pageData.title || 'WikiLearn Course',
      description: pageData.description || 'Online training course from Wikimedia Foundation.',
      url: url,
      type_of_location: 'virtual',
    };

    // Process dates from the page data
    if (pageData.dates) {
      // Try to extract structured date information
      const dateInfo = extractDatesFromPageContent(pageData.dates);
      if (dateInfo) {
        eventData.time_begin = dateInfo.time_begin;
        if (dateInfo.time_end) {
          eventData.time_end = dateInfo.time_end;
        }
      } else {
        // If structured extraction fails, try to parse as simple date
        const simpleDateMatch = pageData.dates.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (simpleDateMatch) {
          const [, year, month, day] = simpleDateMatch;
          const startDate = `${year}-${month}-${day}T00:00:00.000Z`;
          const endDate = `${year}-${month}-${day}T23:59:59.000Z`;

          eventData.time_begin = startDate;
          eventData.time_end = endDate;
        }
      }
    }

    return eventData;
  } catch (error) {
    console.error('Error processing learn.wiki URL:', error);
    return null;
  }
}

export function isValidEventURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const validPatterns = [
    // Meta Wikimedia URLs
    { name: 'Meta Wikimedia', pattern: /^https?:\/\/meta\.wikimedia\.org\/wiki\/.+/i },
    // Local Wikimedia URLs (like br.wikimedia.org)
    { name: 'Local Wikimedia', pattern: /^https?:\/\/[a-z]{2}\.wikimedia\.org\/wiki\/.+/i },
    // WikiLearn URLs
    { name: 'WikiLearn', pattern: /^https?:\/\/app\.learn\.wiki\/learning\/course\/.+/i },
    // Wikidata URLs (for events)
    { name: 'Wikidata', pattern: /^https?:\/\/www\.wikidata\.org\/(wiki|entity)\/Q\d+/i },
  ];

  for (const { name, pattern } of validPatterns) {
    const matches = pattern.test(url);
    if (matches) {
      return true;
    }
  }

  return false;
}

export async function fetchEventDataByGenericURL(url: string): Promise<Partial<Event> | null> {
  // Validate if the URL is from an accepted source
  if (!isValidEventURL(url)) {
    console.error('❌ URL is not from an accepted source:', url);
    return null;
  }

  // First, try as Wikidata URL
  const qid = extractQIDFromURL(url);
  if (qid) {
    return fetchEventDataByQID(qid);
  }

  // If it's not a Wikidata URL, try as Wikimedia URL
  if (
    url.includes('wikimedia.org') ||
    url.includes('wikipedia.org') ||
    url.includes('meta.wikimedia.org')
  ) {
    return fetchEventDataByWikimediaURL(url);
  }

  // If it's a learn.wiki URL
  if (url.includes('learn.wiki')) {
    return fetchEventDataByLearnWikiURL(url);
  }

  // If none of the above options work, return null
  console.error('❌ URL not recognized as Wikidata, Wikimedia or learn.wiki:', url);
  return null;
}
