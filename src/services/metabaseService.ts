import { Event } from '@/types/event';
import { fetchEventFromWikidata, findWikidataQIDByMetaWikiTitle } from './wikidataService';

const METABASE_ENDPOINT = 'https://metabase.wikibase.cloud/query/sparql';

/**
 * Service for SPARQL queries to the Metabase of Wikibase Cloud
 */

export async function fetchEventDataByQID(qid: string): Promise<Partial<Event> | null> {
  if (!qid?.startsWith('Q')) {
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
    if (!data.results?.bindings?.length) {
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

    // If we have a location, set the type as in_person
    if (result.location?.value) {
      eventData.type_of_location = 'in_person';

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
  const yearMatch = /\b(202\d|203\d)\b/.exec(text);
  if (yearMatch) {
    const year = Number.parseInt(yearMatch[1], 10);
    return year;
  }

  return undefined;
}

// DEAD CODE START — language-based date parsing removed (unreliable for multilingual content)
// Dates are now extracted only from:
//   1. Wikidata P580/P582 via wikidataService
//   2. {{Start date|YYYY|M|D}} / {{End date|YYYY|M|D}} templates
//   3. ISO-format values in named infobox parameters (YYYY-MM-DD)
const MONTH_MAP: Record<string, string> = {
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

function getMonthNumber(monthName: string): string | null {
  return MONTH_MAP[monthName.toLowerCase()] || null;
}

interface DateComponents {
  startYear: string;
  startMonth: string;
  startDay: string;
  endYear: string;
  endMonth: string;
  endDay: string;
}

type DatePatternHandler = (match: RegExpMatchArray) => DateComponents | null;

function isValidDateComponents(components: DateComponents): boolean {
  const startYearNum = Number.parseInt(components.startYear, 10);
  const startMonthNum = Number.parseInt(components.startMonth, 10);
  const startDayNum = Number.parseInt(components.startDay, 10);
  const endYearNum = Number.parseInt(components.endYear, 10);
  const endMonthNum = Number.parseInt(components.endMonth, 10);
  const endDayNum = Number.parseInt(components.endDay, 10);

  return (
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
  );
}

function formatDateComponents(components: DateComponents): {
  time_begin: string;
  time_end: string;
} {
  const startDate = `${components.startYear}-${components.startMonth.padStart(2, '0')}-${components.startDay.padStart(2, '0')}T00:00:00.000Z`;
  const endDate = `${components.endYear}-${components.endMonth.padStart(2, '0')}-${components.endDay.padStart(2, '0')}T23:59:59.000Z`;
  return { time_begin: startDate, time_end: endDate };
}

// Pattern handlers
const handlePortugueseRangeWithYear: DatePatternHandler = match => {
  const [, startDayStr, endDayStr, monthName, yearStr] = match;
  const monthNum = getMonthNumber(monthName);
  if (!monthNum) return null;
  return {
    startYear: yearStr,
    startMonth: monthNum,
    startDay: startDayStr,
    endYear: yearStr,
    endMonth: monthNum,
    endDay: endDayStr,
  };
};

const handlePortugueseRangeWithoutYear: DatePatternHandler = match => {
  const [, startDayStr, endDayStr, monthName] = match;
  const monthNum = getMonthNumber(monthName);
  if (!monthNum) return null;
  const currentYear = new Date().getFullYear().toString();
  return {
    startYear: currentYear,
    startMonth: monthNum,
    startDay: startDayStr,
    endYear: currentYear,
    endMonth: monthNum,
    endDay: endDayStr,
  };
};

const handlePortugueseSingleMonth: DatePatternHandler = match => {
  const [, monthName, yearStr] = match;
  const monthNum = getMonthNumber(monthName);
  if (!monthNum) return null;
  return {
    startYear: yearStr,
    startMonth: monthNum,
    startDay: '01',
    endYear: yearStr,
    endMonth: monthNum,
    endDay: '01',
  };
};

const handleMonthRange1: DatePatternHandler = match => {
  const [, monthName, startDayStr, endDayStr, yearStr] = match;
  const monthNum = getMonthNumber(monthName);
  if (!monthNum) return null;
  return {
    startYear: yearStr,
    startMonth: monthNum,
    startDay: startDayStr,
    endYear: yearStr,
    endMonth: monthNum,
    endDay: endDayStr,
  };
};

const handleMonthRange2: DatePatternHandler = match => {
  const [, startDayStr, endDayStr, monthName, yearStr] = match;
  const monthNum = getMonthNumber(monthName);
  if (!monthNum) return null;
  return {
    startYear: yearStr,
    startMonth: monthNum,
    startDay: startDayStr,
    endYear: yearStr,
    endMonth: monthNum,
    endDay: endDayStr,
  };
};

const handleMonthRange3: DatePatternHandler = match => {
  const [, startMonthName, startDayStr, endMonthName, endDayStr, yearStr] = match;
  const startMonthNum = getMonthNumber(startMonthName);
  const endMonthNum = getMonthNumber(endMonthName);
  if (!startMonthNum || !endMonthNum) return null;
  return {
    startYear: yearStr,
    startMonth: startMonthNum,
    startDay: startDayStr,
    endYear: yearStr,
    endMonth: endMonthNum,
    endDay: endDayStr,
  };
};

const handleMonthRange4: DatePatternHandler = match => {
  const [, startMonthName, startDayStr, startYearStr, endMonthName, endDayStr, endYearStr] = match;
  const startMonthNum = getMonthNumber(startMonthName);
  const endMonthNum = getMonthNumber(endMonthName);
  if (!startMonthNum || !endMonthNum) return null;
  return {
    startYear: startYearStr,
    startMonth: startMonthNum,
    startDay: startDayStr,
    endYear: endYearStr,
    endMonth: endMonthNum,
    endDay: endDayStr,
  };
};

const handleISORange: DatePatternHandler = match => {
  const [, startYear, startMonth, startDay, endYear, endMonth, endDay] = match;
  return { startYear, startMonth, startDay, endYear, endMonth, endDay };
};

const handleEuropeanRange: DatePatternHandler = match => {
  const [, startDay, startMonth, startYear, endDay, endMonth, endYear] = match;
  return { startYear, startMonth, startDay, endYear, endMonth, endDay };
};

const handleAmericanRange: DatePatternHandler = match => {
  const [, startMonth, startDay, startYear, endMonth, endDay, endYear] = match;
  return { startYear, startMonth, startDay, endYear, endMonth, endDay };
};

const handleConsecutiveDays: DatePatternHandler = match => {
  const [, startDay, endDay, startMonth, startYear] = match;
  let year = startYear;
  if (year.length === 2) {
    const yearNum = Number.parseInt(year, 10);
    year = yearNum > 50 ? `19${year}` : `20${year}`;
  }
  return {
    startYear: year,
    startMonth,
    startDay,
    endYear: year,
    endMonth: startMonth,
    endDay,
  };
};

const handleSimpleRange: DatePatternHandler = match => {
  const [, startDay, endDay, startYear] = match;
  return {
    startYear,
    startMonth: '01',
    startDay,
    endYear: startYear,
    endMonth: '01',
    endDay,
  };
};

const handleSingleMonth1: DatePatternHandler = match => {
  const [, monthName, dayStr, yearStr] = match;
  const monthNum = getMonthNumber(monthName);
  if (!monthNum) return null;
  return {
    startYear: yearStr,
    startMonth: monthNum,
    startDay: dayStr,
    endYear: yearStr,
    endMonth: monthNum,
    endDay: dayStr,
  };
};

const handleSingleMonth2: DatePatternHandler = match => {
  const [, dayStr, monthName, yearStr] = match;
  const monthNum = getMonthNumber(monthName);
  if (!monthNum) return null;
  return {
    startYear: yearStr,
    startMonth: monthNum,
    startDay: dayStr,
    endYear: yearStr,
    endMonth: monthNum,
    endDay: dayStr,
  };
};

const handleISOSingle: DatePatternHandler = match => {
  const [, startYear, startMonth, startDay] = match;
  return {
    startYear,
    startMonth,
    startDay,
    endYear: startYear,
    endMonth: startMonth,
    endDay: startDay,
  };
};

const handleEuropeanSingle: DatePatternHandler = match => {
  const [, startDay, startMonth, startYear] = match;
  return {
    startYear,
    startMonth,
    startDay,
    endYear: startYear,
    endMonth: startMonth,
    endDay: startDay,
  };
};

const handleAmericanSingle: DatePatternHandler = match => {
  const [, startMonth, startDay, startYear] = match;
  return {
    startYear,
    startMonth,
    startDay,
    endYear: startYear,
    endMonth: startMonth,
    endDay: startDay,
  };
};

const PATTERNS: Array<{ pattern: RegExp; handler: DatePatternHandler }> = [
  {
    pattern: /(\d{1,2})\s+(?:e|a)\s+(\d{1,2})\s+de\s+(\w{3,12})\s+de\s+(\d{4})/gi,
    handler: handlePortugueseRangeWithYear,
  },
  {
    pattern: /(\d{1,2})\s+(?:e|a)\s+(\d{1,2})\s+de\s+(\w{3,12})/gi,
    handler: handlePortugueseRangeWithoutYear,
  },
  { pattern: /(\w{3,12})\s+de\s+(\d{4})/gi, handler: handlePortugueseSingleMonth },
  {
    pattern: /(\w{3,12})\s+(\d{1,2})\s*(?:to|até|a|-|–)\s*(\d{1,2}),?\s*(\d{4})/gi,
    handler: handleMonthRange1,
  },
  {
    pattern: /(\d{1,2})\s*(?:to|até|a|-|–)\s*(\d{1,2})\s+(\w{3,12})\s+(\d{4})/gi,
    handler: handleMonthRange2,
  },
  {
    pattern: /(\w{3,12})\s+(\d{1,2})\s+to\s+(\w{3,12})\s+(\d{1,2}),?\s*(\d{4})/gi,
    handler: handleMonthRange3,
  },
  {
    pattern:
      /(\w{3,12})\s+(\d{1,2}),?\s*(\d{4})\s*(?:to|até|a|-|–)\s*(\w{3,12})\s+(\d{1,2}),?\s*(\d{4})/gi,
    handler: handleMonthRange4,
  },
  {
    pattern: /(\d{4})-(\d{1,2})-(\d{1,2})\s*(?:to|até|a|-|–)\s*(\d{4})-(\d{1,2})-(\d{1,2})/gi,
    handler: handleISORange,
  },
  {
    pattern:
      /(\d{1,2})[/.](\d{1,2})[/.](\d{4})\s*(?:to|até|a|-|–)\s*(\d{1,2})[/.](\d{1,2})[/.](\d{4})/gi,
    handler: handleEuropeanRange,
  },
  {
    pattern:
      /(\d{1,2})[/-](\d{1,2})[/-](\d{4})\s*(?:to|até|a|-|–)\s*(\d{1,2})[/-](\d{1,2})[/-](\d{4})/gi,
    handler: handleAmericanRange,
  },
  { pattern: /(\d{1,2})-(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})/gi, handler: handleConsecutiveDays },
  { pattern: /(\d{1,2})\s*(?:to|até|a|-|–)\s*(\d{1,2})\s+(\d{4})/gi, handler: handleSimpleRange },
  { pattern: /(\w{3,12})\s+(\d{1,2}),?\s*(\d{4})/gi, handler: handleSingleMonth1 },
  { pattern: /(\d{1,2})\s+(\w{3,12})\s+(\d{4})/gi, handler: handleSingleMonth2 },
  { pattern: /(\d{4})-(\d{1,2})-(\d{1,2})/gi, handler: handleISOSingle },
  { pattern: /(\d{1,2})[/.](\d{1,2})[/.](\d{4})/gi, handler: handleEuropeanSingle },
  { pattern: /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/gi, handler: handleAmericanSingle },
];

export function extractDatesFromPageContent(
  pageContent: string
): { time_begin: string; time_end?: string } | undefined {
  if (!pageContent) return undefined;

  for (const { pattern, handler } of PATTERNS) {
    const matches = Array.from(pageContent.matchAll(pattern));

    for (const match of matches) {
      try {
        const components = handler(match);
        if (components && isValidDateComponents(components)) {
          return formatDateComponents(components);
        }
      } catch (error) {
        console.error('❌ Error processing date match:', error, match);
        continue;
      }
    }
  }

  return undefined;
}
// DEAD CODE END

export function extractWikimediaTitleFromURL(url: string): string | undefined {
  if (!url) return undefined;

  try {
    // URL patterns for Wikimedia - Updated to handle Event: namespace, special characters, and mobile URLs
    const patterns = [
      /(m\.)?wikimedia\.org\/wiki\/(.+)/i,
      /(m\.)?wikipedia\.org\/wiki\/(.+)/i,
      /meta\.(m\.)?wikimedia\.org\/wiki\/(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        // Get the title from the last capture group (which contains the actual title)
        const titleMatch = match[match.length - 1];
        if (titleMatch) {
          try {
            // Decode the URL title (to handle special characters like %26)
            const rawTitle = titleMatch;
            // Remove fragment identifier (#) and query parameters (?)
            const cleanTitle = rawTitle.split('#')[0].split('?')[0];
            const decodedTitle = decodeURIComponent(cleanTitle);
            // Replace underscores with spaces
            return decodedTitle.replace(/_/g, ' ');
          } catch (error) {
            console.error('Error extracting title from URL:', error);
            // If decoding fails, use the original with underscores replaced
            return titleMatch?.replace(/_/g, ' ') || undefined;
          }
        }
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
    const patterns = [
      /wikidata\.org\/wiki\/(Q\d{1,10})/i,
      /wikidata\.org\/entity\/(Q\d{1,10})/i,
      /(Q\d{1,10})$/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
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

  return fetchEventFromWikidata(qid);
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

    if (!data.results?.bindings?.length) {
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

// Parse the first page object from a settled MediaWiki "query" response
async function firstQueryPage(settled: PromiseSettledResult<Response>): Promise<any | null> {
  if (settled.status !== 'fulfilled' || !settled.value.ok) return null;
  const data = await settled.value.json();
  const pages = data.query?.pages;
  if (!pages) return null;
  const pageId = Object.keys(pages)[0];
  return pages[pageId] ?? null;
}

async function extractPageContent(
  settled: PromiseSettledResult<Response>
): Promise<string | undefined> {
  const page = await firstQueryPage(settled);
  return page?.extract || undefined;
}

async function extractWikidataQid(
  settled: PromiseSettledResult<Response>
): Promise<string | undefined> {
  const page = await firstQueryPage(settled);
  return page?.pageprops?.wikibase_item || undefined;
}

async function extractInfobox(settled: PromiseSettledResult<Response>): Promise<any> {
  const page = await firstQueryPage(settled);
  const wikitext = page?.revisions?.[0]?.['*'];
  return wikitext ? extractInfoboxFromWikitext(wikitext) : null;
}

async function extractRenderedText(
  settled: PromiseSettledResult<Response>
): Promise<string | undefined> {
  if (settled.status !== 'fulfilled' || !settled.value.ok) return undefined;
  const data = await settled.value.json();
  const html = data.parse?.text?.['*'];
  return html ? stripHtmlTags(html) : undefined;
}

async function fetchWikimediaPageData(url: string): Promise<{
  content?: string;
  wikidata_qid?: string;
  infobox?: any;
  categories?: string[];
  renderedText?: string;
} | null> {
  try {
    // Extract domain and page title from URL
    const urlMatch = new RegExp(/https?:[/][/]([^/]{1,100})[/]wiki[/](.{1,200})/i).exec(url);
    if (!urlMatch) return null;

    const domain = urlMatch?.[1];
    const pageTitle = urlMatch?.[2];
    const cleanTitle = pageTitle.replace(/_/g, ' ');

    // Multiple API calls to get comprehensive data
    const [contentData, wikidataData, infoboxData, parsedData] = await Promise.allSettled([
      // 1. Get intro section only (cleaner description)
      fetch(
        `https://${domain}/w/api.php?action=query&format=json&titles=${encodeURIComponent(cleanTitle)}&prop=extracts&explaintext=true&exintro=true&exsectionformat=plain&origin=*`
      ),

      // 2. Get Wikidata QID if available
      fetch(
        `https://${domain}/w/api.php?action=query&format=json&titles=${encodeURIComponent(cleanTitle)}&prop=pageprops&origin=*`
      ),

      // 3. Get page with wikitext to extract infobox
      fetch(
        `https://${domain}/w/api.php?action=query&format=json&titles=${encodeURIComponent(cleanTitle)}&prop=revisions&rvprop=content&origin=*`
      ),

      // 4. Get rendered HTML (resolves template transclusions like {{../Header}})
      fetch(
        `https://${domain}/w/api.php?action=parse&format=json&page=${encodeURIComponent(cleanTitle)}&prop=text&origin=*`
      ),
    ]);

    return {
      content: await extractPageContent(contentData),
      wikidata_qid: await extractWikidataQid(wikidataData),
      infobox: await extractInfobox(infoboxData),
      categories: [],
      renderedText: await extractRenderedText(parsedData),
    };
  } catch (error) {
    console.error('Error fetching Wikimedia page data:', error);
    return null;
  }
}

/**
 * Comprehensive multilingual month name → month number mapping.
 * Covers all major languages used on Wikimedia sites.
 * This is a data-driven lookup table, not language-specific regex logic.
 */
const MULTILINGUAL_MONTHS: Record<string, number> = {};

// Helper to populate the map without duplicate key issues
function addMonths(entries: [string, number][]) {
  for (const [name, num] of entries) {
    MULTILINGUAL_MONTHS[name] = num;
  }
}

// English
addMonths([
  ['january', 1],
  ['february', 2],
  ['march', 3],
  ['april', 4],
  ['may', 5],
  ['june', 6],
  ['july', 7],
  ['august', 8],
  ['september', 9],
  ['october', 10],
  ['november', 11],
  ['december', 12],
  ['jan', 1],
  ['feb', 2],
  ['mar', 3],
  ['apr', 4],
  ['jun', 6],
  ['jul', 7],
  ['aug', 8],
  ['sep', 9],
  ['oct', 10],
  ['nov', 11],
  ['dec', 12],
]);
// German
addMonths([
  ['januar', 1],
  ['februar', 2],
  ['märz', 3],
  ['mai', 5],
  ['juni', 6],
  ['juli', 7],
  ['oktober', 10],
  ['dezember', 12],
]);
// French
addMonths([
  ['janvier', 1],
  ['février', 2],
  ['mars', 3],
  ['avril', 4],
  ['juillet', 7],
  ['août', 8],
  ['septembre', 9],
  ['octobre', 10],
  ['novembre', 11],
  ['décembre', 12],
]);
// Spanish
addMonths([
  ['enero', 1],
  ['febrero', 2],
  ['marzo', 3],
  ['abril', 4],
  ['mayo', 5],
  ['junio', 6],
  ['julio', 7],
  ['agosto', 8],
  ['septiembre', 9],
  ['noviembre', 11],
  ['diciembre', 12],
]);
// Portuguese
addMonths([
  ['janeiro', 1],
  ['fevereiro', 2],
  ['março', 3],
  ['maio', 5],
  ['junho', 6],
  ['julho', 7],
  ['setembro', 9],
  ['outubro', 10],
  ['novembro', 11],
  ['dezembro', 12],
]);
// Italian
addMonths([
  ['gennaio', 1],
  ['febbraio', 2],
  ['aprile', 4],
  ['maggio', 5],
  ['giugno', 6],
  ['luglio', 7],
  ['settembre', 9],
  ['ottobre', 10],
  ['dicembre', 12],
]);
// Dutch
addMonths([
  ['januari', 1],
  ['februari', 2],
  ['maart', 3],
  ['mei', 5],
  ['augustus', 8],
]);
// Polish
addMonths([
  ['styczeń', 1],
  ['stycznia', 1],
  ['luty', 2],
  ['lutego', 2],
  ['marzec', 3],
  ['marca', 3],
  ['kwiecień', 4],
  ['kwietnia', 4],
  ['maj', 5],
  ['maja', 5],
  ['czerwiec', 6],
  ['czerwca', 6],
  ['lipiec', 7],
  ['lipca', 7],
  ['sierpień', 8],
  ['sierpnia', 8],
  ['wrzesień', 9],
  ['września', 9],
  ['październik', 10],
  ['października', 10],
  ['listopad', 11],
  ['listopada', 11],
  ['grudzień', 12],
  ['grudnia', 12],
]);
// Russian
addMonths([
  ['январь', 1],
  ['января', 1],
  ['февраль', 2],
  ['февраля', 2],
  ['март', 3],
  ['марта', 3],
  ['апрель', 4],
  ['апреля', 4],
  ['мая', 5],
  ['июнь', 6],
  ['июня', 6],
  ['июль', 7],
  ['июля', 7],
  ['август', 8],
  ['августа', 8],
  ['сентябрь', 9],
  ['сентября', 9],
  ['октябрь', 10],
  ['октября', 10],
  ['ноябрь', 11],
  ['ноября', 11],
  ['декабрь', 12],
  ['декабря', 12],
]);
// Turkish
addMonths([
  ['ocak', 1],
  ['şubat', 2],
  ['mart', 3],
  ['nisan', 4],
  ['mayıs', 5],
  ['haziran', 6],
  ['temmuz', 7],
  ['ağustos', 8],
  ['eylül', 9],
  ['ekim', 10],
  ['kasım', 11],
  ['aralık', 12],
]);
// Arabic
addMonths([
  ['يناير', 1],
  ['فبراير', 2],
  ['مارس', 3],
  ['أبريل', 4],
  ['مايو', 5],
  ['يونيو', 6],
  ['يوليو', 7],
  ['أغسطس', 8],
  ['سبتمبر', 9],
  ['أكتوبر', 10],
  ['نوفمبر', 11],
  ['ديسمبر', 12],
]);
// Indonesian/Malay
addMonths([
  ['maret', 3],
  ['agustus', 8],
  ['desember', 12],
]);
// Swedish/Norwegian/Danish
addMonths([['augusti', 8]]);
// Czech
addMonths([
  ['leden', 1],
  ['ledna', 1],
  ['únor', 2],
  ['února', 2],
  ['březen', 3],
  ['března', 3],
  ['duben', 4],
  ['dubna', 4],
  ['květen', 5],
  ['května', 5],
  ['červen', 6],
  ['června', 6],
  ['červenec', 7],
  ['července', 7],
  ['srpen', 8],
  ['srpna', 8],
  ['září', 9],
  ['říjen', 10],
  ['října', 10],
  ['prosinec', 12],
  ['prosince', 12],
]);
// Hungarian
addMonths([
  ['január', 1],
  ['februári', 2],
  ['március', 3],
  ['április', 4],
  ['május', 5],
  ['június', 6],
  ['július', 7],
  ['augusztus', 8],
  ['szeptemberi', 9],
  ['októberi', 10],
  ['novemberi', 11],
  ['decemberi', 12],
]);
// Romanian
addMonths([
  ['ianuarie', 1],
  ['februarie', 2],
  ['martie', 3],
  ['aprilie', 4],
  ['mai', 5],
  ['iunie', 6],
  ['iulie', 7],
  ['septembrie', 9],
  ['octombrie', 10],
  ['noiembrie', 11],
  ['decembrie', 12],
]);
// Finnish
addMonths([
  ['tammikuu', 1],
  ['helmikuu', 2],
  ['maaliskuu', 3],
  ['huhtikuu', 4],
  ['toukokuu', 5],
  ['kesäkuu', 6],
  ['heinäkuu', 7],
  ['elokuu', 8],
  ['syyskuu', 9],
  ['lokakuu', 10],
  ['marraskuu', 11],
  ['joulukuu', 12],
]);
// Catalan
addMonths([
  ['gener', 1],
  ['febrer', 2],
  ['març', 3],
  ['maig', 5],
  ['juny', 6],
  ['juliol', 7],
  ['agost', 8],
  ['setembre', 9],
]);
// Hindi
addMonths([
  ['जनवरी', 1],
  ['फ़रवरी', 2],
  ['मार्च', 3],
  ['अप्रैल', 4],
  ['मई', 5],
  ['जून', 6],
  ['जुलाई', 7],
  ['अगस्त', 8],
  ['सितंबर', 9],
  ['अक्टूबर', 10],
  ['नवंबर', 11],
  ['दिसंबर', 12],
]);

/**
 * Strips HTML tags from a string and normalizes whitespace.
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts dates from rendered page text using multilingual month lookup.
 * Looks for patterns like:
 *   "19. – 22. Februar 2026"  (day–day month year)
 *   "February 19 – 22, 2026"  (month day–day year)
 *   "19 February – 22 February 2026" (day month – day month year)
 * Returns { start_date, end_date } in YYYY-MM-DD format or null.
 */
type ParsedEventDate = { start_date: string; end_date?: string };

const padDay = (n: number) => n.toString().padStart(2, '0');
const lookupMonth = (name: string) => MULTILINGUAL_MONTHS[name.toLowerCase()];
const isValidEventYear = (y: number) => y >= 2020 && y <= 2035;

// CJK range: "YYYY年M月D日 – YYYY年M月D日"
function parseCjkRange(text: string, pattern: RegExp): ParsedEventDate | null {
  const match = pattern.exec(text);
  if (!match) return null;
  const [, sy, sm, sd, ey, em, ed] = match.map(Number);
  if (isValidEventYear(sy) && isValidEventYear(ey)) {
    return {
      start_date: `${sy}-${padDay(sm)}-${padDay(sd)}`,
      end_date: `${ey}-${padDay(em)}-${padDay(ed)}`,
    };
  }
  return null;
}

// "DD Month – DD Month YYYY" (cross-month range)
function parseCrossMonthRange(text: string, pattern: RegExp): ParsedEventDate | null {
  const match = pattern.exec(text);
  if (!match) return null;
  const startDay = Number(match[1]);
  const startMonth = lookupMonth(match[2]);
  const endDay = Number(match[3]);
  const endMonth = lookupMonth(match[4]);
  const year = Number(match[5]);
  if (startMonth && endMonth && isValidEventYear(year)) {
    return {
      start_date: `${year}-${padDay(startMonth)}-${padDay(startDay)}`,
      end_date: `${year}-${padDay(endMonth)}-${padDay(endDay)}`,
    };
  }
  return null;
}

// "Month DD – Month DD, YYYY"
function parseCrossMonthRangeEnglish(text: string, pattern: RegExp): ParsedEventDate | null {
  const match = pattern.exec(text);
  if (!match) return null;
  const startMonth = lookupMonth(match[1]);
  const startDay = Number(match[2]);
  const endMonth = lookupMonth(match[3]);
  const endDay = Number(match[4]);
  const year = Number(match[5]);
  if (startMonth && endMonth && isValidEventYear(year)) {
    return {
      start_date: `${year}-${padDay(startMonth)}-${padDay(startDay)}`,
      end_date: `${year}-${padDay(endMonth)}-${padDay(endDay)}`,
    };
  }
  return null;
}

// "DD – DD Month YYYY" (same-month range)
function parseSameMonthRange(text: string, pattern: RegExp): ParsedEventDate | null {
  const match = pattern.exec(text);
  if (!match) return null;
  const startDay = Number(match[1]);
  const endDay = Number(match[2]);
  const month = lookupMonth(match[3]);
  const year = Number(match[4]);
  if (month && isValidEventYear(year)) {
    return {
      start_date: `${year}-${padDay(month)}-${padDay(startDay)}`,
      end_date: `${year}-${padDay(month)}-${padDay(endDay)}`,
    };
  }
  return null;
}

// "Month DD – DD, YYYY" (same-month range, English)
function parseSameMonthRangeEnglish(text: string, pattern: RegExp): ParsedEventDate | null {
  const match = pattern.exec(text);
  if (!match) return null;
  const month = lookupMonth(match[1]);
  const startDay = Number(match[2]);
  const endDay = Number(match[3]);
  const year = Number(match[4]);
  if (month && isValidEventYear(year)) {
    return {
      start_date: `${year}-${padDay(month)}-${padDay(startDay)}`,
      end_date: `${year}-${padDay(month)}-${padDay(endDay)}`,
    };
  }
  return null;
}

// "DD Month YYYY" (single date)
function parseSingleDayMonthYear(text: string, pattern: RegExp): ParsedEventDate | null {
  const match = pattern.exec(text);
  if (!match) return null;
  const day = Number(match[1]);
  const month = lookupMonth(match[2]);
  const year = Number(match[3]);
  if (month && isValidEventYear(year)) {
    return { start_date: `${year}-${padDay(month)}-${padDay(day)}` };
  }
  return null;
}

// "Month DD, YYYY" (single date, English)
function parseSingleMonthDayYear(text: string, pattern: RegExp): ParsedEventDate | null {
  const match = pattern.exec(text);
  if (!match) return null;
  const month = lookupMonth(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  if (month && isValidEventYear(year)) {
    return { start_date: `${year}-${padDay(month)}-${padDay(day)}` };
  }
  return null;
}

// CJK single date: "YYYY年M月D日"
function parseCjkSingle(text: string, pattern: RegExp): ParsedEventDate | null {
  const match = pattern.exec(text);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  if (isValidEventYear(y)) {
    return { start_date: `${y}-${padDay(m)}-${padDay(d)}` };
  }
  return null;
}

function extractDatesFromRenderedText(text: string): ParsedEventDate | null {
  if (!text) return null;

  // Build a regex alternation from all known month names (sorted longest-first to avoid partial matches)
  const monthNames = Object.keys(MULTILINGUAL_MONTHS).sort((a, b) => b.length - a.length);
  const monthPattern = monthNames.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

  // Pattern 1: "DD. – DD. Month YYYY" or "DD – DD Month YYYY" (German-style)
  const pattern1 = new RegExp(
    `(\\d{1,2})\\.?\\s*[–\\-−~]\\s*(\\d{1,2})\\.?\\s+(${monthPattern})\\s+(\\d{4})`,
    'i'
  );

  // Pattern 2: "Month DD – DD, YYYY" (English-style)
  const pattern2 = new RegExp(
    `(${monthPattern})\\s+(\\d{1,2})\\s*[–\\-−~]\\s*(\\d{1,2}),?\\s*(\\d{4})`,
    'i'
  );

  // Pattern 3: "DD Month – DD Month YYYY" (cross-month range)
  const pattern3 = new RegExp(
    `(\\d{1,2})\\.?\\s+(${monthPattern})\\s*[–\\-−~]\\s*(\\d{1,2})\\.?\\s+(${monthPattern})\\s+(\\d{4})`,
    'i'
  );

  // Pattern 4: "Month DD – Month DD, YYYY"
  const pattern4 = new RegExp(
    `(${monthPattern})\\s+(\\d{1,2})\\s*[–\\-−~]\\s*(${monthPattern})\\s+(\\d{1,2}),?\\s*(\\d{4})`,
    'i'
  );

  // Pattern 5: "DD Month YYYY" (single date)
  const pattern5 = new RegExp(`(\\d{1,2})\\.?\\s+(${monthPattern})\\s+(\\d{4})`, 'i');

  // Pattern 6: "Month DD, YYYY" (single date, English)
  const pattern6 = new RegExp(`(${monthPattern})\\s+(\\d{1,2}),?\\s+(\\d{4})`, 'i');

  // Pattern 7: CJK numeric months "YYYY年M月D日"
  const pattern7 = /(\d{4})年(\d{1,2})月(\d{1,2})日\s*[–\-−~]\s*(\d{4})年(\d{1,2})月(\d{1,2})日/;
  const pattern7single = /(\d{4})年(\d{1,2})月(\d{1,2})日/;

  // Try each pattern in priority order; first match wins.
  return (
    parseCjkRange(text, pattern7) ??
    parseCrossMonthRange(text, pattern3) ??
    parseCrossMonthRangeEnglish(text, pattern4) ??
    parseSameMonthRange(text, pattern1) ??
    parseSameMonthRangeEnglish(text, pattern2) ??
    parseSingleDayMonthYear(text, pattern5) ??
    parseSingleMonthDayYear(text, pattern6) ??
    parseCjkSingle(text, pattern7single)
  );
}

/**
 * Parses {{Start date|YYYY|M|D}} or {{End date|YYYY|M|D}} templates.
 * Returns an ISO date string or null.
 */
function parseDateTemplate(wikitext: string, templateName: string): string | null {
  const pattern = new RegExp(
    `\\{\\{\\s*${templateName}\\s*\\|\\s*(\\d{4})\\s*\\|\\s*(\\d{1,2})\\s*\\|\\s*(\\d{1,2})`,
    'i'
  );
  const match = pattern.exec(wikitext);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Detects event format (virtual/in_person/hybrid) from wikitext keywords.
 */
function detectLocationTypeFromWikitext(wikitext: string): string | null {
  const lower = wikitext.toLowerCase();
  if (/\bonline\b|\bvirtual\b|\bremote\b/.test(lower)) return 'virtual';
  if (/\bin.person\b|\bface.to.face\b|\bpresencial\b/.test(lower)) return 'in_person';
  if (/\bhybrid\b|\bhíbrido\b/.test(lower)) return 'hybrid';
  return null;
}

function extractInfoboxFromWikitext(wikitext: string): any {
  if (!wikitext) return null;

  try {
    const data: any = {};

    // 1. {{Start date|YYYY|M|D}} / {{End date|YYYY|M|D}} templates — fully language-agnostic
    const startDate =
      parseDateTemplate(wikitext, 'Start date') ||
      parseDateTemplate(wikitext, 'Start date and age');
    if (startDate) data.start_date = startDate;

    const endDate = parseDateTemplate(wikitext, 'End date');
    if (endDate) data.end_date = endDate;

    // 2. ISO-format values (YYYY-MM-DD) in named parameters — language-agnostic
    if (!data.start_date) {
      const m =
        /\|\s*(?:start_date|time_begin|begin_date|date_start|date_begin)\s*=\s*(\d{4}-\d{2}-\d{2})/i.exec(
          wikitext
        );
      if (m?.[1]) data.start_date = m[1];
    }
    if (!data.end_date) {
      const m = /\|\s*(?:end_date|time_end|date_end)\s*=\s*(\d{4}-\d{2}-\d{2})/i.exec(wikitext);
      if (m?.[1]) data.end_date = m[1];
    }

    // 3. Location field (used to infer in_person)
    const locationMatch = /\|\s*location\s*=\s*([^|\n}]{1,200})/i.exec(wikitext);
    if (locationMatch?.[1]?.trim()) data.location = locationMatch[1].trim();

    // 4. Location type from a small set of universally understood English keywords
    //    used in Wikimedia event templates (online/virtual/hybrid).
    if (!data.location) {
      const detectedType = detectLocationTypeFromWikitext(wikitext);
      if (detectedType) data.locationType = detectedType;
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

/**
 * Processes infobox data to extract event information.
 * Only uses language-agnostic structured data — no natural language parsing.
 */
function processInfoboxData(infobox: any, eventData: Partial<Event>): void {
  // Dates come only from ISO-format values or {{Start/End date}} templates
  if (infobox.start_date) {
    eventData.time_begin = `${infobox.start_date}T00:00:00.000Z`;
  }
  if (infobox.end_date) {
    eventData.time_end = `${infobox.end_date}T23:59:59.000Z`;
  }

  if (infobox.location) {
    eventData.type_of_location = 'in_person';
  } else if (infobox.locationType) {
    eventData.type_of_location = infobox.locationType;
  }
}

/**
 * Extracts description from page content.
 * Does NOT attempt to parse dates from plain text — dates must come from
 * structured sources (Wikidata or wikitext templates) to be reliable.
 */
function processPageContent(content: string, eventData: Partial<Event>): void {
  if (!eventData.description) {
    const description = extractDescriptionFromContent(content);
    if (description) {
      eventData.description = description;
    }
  }
}

/**
 * Determines event type, name, and location based on page title and year
 */
function determineEventTypeAndLocation(
  pageTitle: string,
  extractedYear: number | undefined,
  eventData: Partial<Event>
): void {
  if (!extractedYear) return;

  const lowerPageTitle = pageTitle.toLowerCase();

  if (lowerPageTitle.includes('wikicon')) {
    eventData.name = `WikiCon Brasil ${extractedYear}`;
    if (!eventData.type_of_location) {
      eventData.type_of_location = 'hybrid';
    }
  } else if (lowerPageTitle.includes('wikimania')) {
    eventData.name = `Wikimania ${extractedYear}`;
    if (!eventData.type_of_location) {
      eventData.type_of_location = 'in_person';
    }
  } else {
    if (!eventData.type_of_location) {
      eventData.type_of_location = 'hybrid';
    }
  }
}

/**
 * Creates fallback event data when main processing fails
 */
function createFallbackEventData(pageTitle: string, url: string): Partial<Event> | null {
  const lowerPageTitle = pageTitle.toLowerCase();
  const extractedYear = extractYearFromText(pageTitle) || extractYearFromText(url);

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

// Fallback: fill an event's dates from rendered HTML when it has no start time yet
function applyRenderedDates(target: Partial<Event>, renderedText: string | undefined): void {
  if (target.time_begin || !renderedText) return;
  const renderedDates = extractDatesFromRenderedText(renderedText);
  if (!renderedDates) return;
  target.time_begin = `${renderedDates.start_date}T00:00:00.000Z`;
  if (renderedDates.end_date) {
    target.time_end = `${renderedDates.end_date}T23:59:59.000Z`;
  }
}

// Build event data from a Wikidata entity, enriching it with page data
async function buildEventFromWikidata(
  wikidataQid: string,
  url: string,
  pageData: { content?: string; renderedText?: string } | null
): Promise<Partial<Event> | null> {
  const wikidataResult = await fetchEventFromWikidata(wikidataQid);
  if (!wikidataResult) return null;

  wikidataResult.url = url;
  // Use the page intro as description if Wikidata only has a short tagline
  if (
    pageData?.content &&
    (!wikidataResult.description || wikidataResult.description.length < 80)
  ) {
    wikidataResult.description = extractDescriptionFromContent(pageData.content);
  }
  // Fallback: if Wikidata has no dates, try rendered HTML
  applyRenderedDates(wikidataResult, pageData?.renderedText);

  return wikidataResult;
}

export async function fetchEventDataByWikimediaURL(url: string): Promise<Partial<Event> | null> {
  const pageTitle = extractWikimediaTitleFromURL(url);

  if (!pageTitle) {
    console.error('Unable to extract the page title from the URL:', url);
    return null;
  }

  try {
    const pageData = await fetchWikimediaPageData(url);

    // Try Wikidata lookup: first via pageprops wikibase_item, then via sitelink
    const wikidataQid = pageData?.wikidata_qid || (await findWikidataQIDByMetaWikiTitle(pageTitle));

    if (wikidataQid) {
      const fromWikidata = await buildEventFromWikidata(wikidataQid, url, pageData);
      if (fromWikidata) return fromWikidata;
    }

    const extractedYear = extractYearFromText(pageTitle) || extractYearFromText(url);
    const eventData: Partial<Event> = {
      name: pageTitle,
      url: url,
    };

    if (pageData?.infobox) {
      processInfoboxData(pageData.infobox, eventData);
    }

    if (pageData?.content && (!eventData.description || !eventData.time_begin)) {
      processPageContent(pageData.content, eventData);
    }

    // Fallback: extract dates from rendered HTML (resolves template transclusions)
    applyRenderedDates(eventData, pageData?.renderedText);

    determineEventTypeAndLocation(pageTitle, extractedYear, eventData);

    return eventData;
  } catch (error) {
    console.error('Error fetching event data from Wikimedia:', error);
    return createFallbackEventData(pageTitle, url);
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
    const courseMatch = new RegExp(/course-v1:([^/]{1,100})/i).exec(url);
    if (!courseMatch?.[1]) {
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
  if (!url?.includes('learn.wiki')) return null;

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

    // pageData.dates is a plain ISO date derived from the URL (YYYY-01-01)
    if (pageData.dates) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(pageData.dates);
      if (m) {
        const [, year, month, day] = m;
        eventData.time_begin = `${year}-${month}-${day}T00:00:00.000Z`;
        eventData.time_end = `${year}-${month}-${day}T23:59:59.000Z`;
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
    // Meta Wikimedia URLs (desktop and mobile)
    { name: 'Meta Wikimedia', pattern: /^https?:\/\/meta\.(m\.)?wikimedia\.org\/wiki\/.+/i },
    // Local Wikimedia URLs (like br.wikimedia.org, desktop and mobile)
    { name: 'Local Wikimedia', pattern: /^https?:\/\/[a-z]{2}\.(m\.)?wikimedia\.org\/wiki\/.+/i },
    // WikiLearn URLs
    { name: 'WikiLearn', pattern: /^https?:\/\/app\.learn\.wiki\/learning\/course\/.+/i },
    // Wikidata URLs (for events)
    { name: 'Wikidata', pattern: /^https?:\/\/www\.wikidata\.org\/(wiki|entity)\/Q\d+/i },
  ];

  for (const { pattern } of validPatterns) {
    const matches = new RegExp(pattern).exec(url);
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
    return fetchEventFromWikidata(qid);
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
