import { Event } from '@/types/event';

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
  const yearMatch = /\b(202\d|203\d)\b/.exec(text);
  if (yearMatch) {
    const year = Number.parseInt(yearMatch[1], 10);
    return year;
  }

  return undefined;
}

// Month name to number mapping (English and Portuguese)
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

  // Fallback: try to extract at least the year and create default dates
  const yearMatch = /\b(202\d|203\d)\b/.exec(pageContent);
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

async function fetchWikimediaPageData(url: string): Promise<{
  content?: string;
  wikidata_qid?: string;
  infobox?: any;
  categories?: string[];
} | null> {
  try {
    // Extract domain and page title from URL
    const urlMatch = new RegExp(/https?:[/][/]([^/]{1,100})[/]wiki[/](.{1,200})/i).exec(url);
    if (!urlMatch) return null;

    const domain = urlMatch?.[1];
    const pageTitle = urlMatch?.[2];
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
    let categories: string[] = [];

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

    // First try to find infobox - limit to prevent ReDoS
    const infoboxMatch = wikitext.match(/\{\{[Ii]nfobox[\s\S]{1,5000}?\}\}/g);
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
        const match = new RegExp(pattern.regex).exec(infoboxText);
        if (match?.[1]) {
          data[pattern.key] = match[1].trim();
        }
      }

      // Extract location from infobox
      const locationMatch = new RegExp(/\|\s*location\s*=\s*([^|\n]+)/i).exec(infoboxText);
      if (locationMatch?.[1]) {
        data.location = locationMatch[1].trim();
      }

      // Extract description/summary from infobox
      const summaryMatch = new RegExp(/\|\s*(summary|description)\s*=\s*([^|\n]+)/i).exec(
        infoboxText
      );
      if (summaryMatch?.[2]) {
        data.description = summaryMatch[2].trim();
      }
    }

    // If no infobox or missing data, try to extract from the main content
    if (!data.date && !data.dates && !data.when) {
      // Look for date patterns in the main content
      const datePatterns = [
        // "19 e 20 de julho de 2025"
        /(\d{1,2})\s+e\s+(\d{1,2})\s+de\s+(\w{3,12})\s+de\s+(\d{4})/gi,
        // "19 e 20 de julho"
        /(\d{1,2})\s+e\s+(\d{1,2})\s+de\s+(\w{3,12})/gi,
        // "19-20 de julho de 2025"
        /(\d{1,2})-(\d{1,2})\s+de\s+(\w{3,12})\s+de\s+(\d{4})/gi,
        // "19 a 20 de julho de 2025"
        /(\d{1,2})\s+a\s+(\d{1,2})\s+de\s+(\w{3,12})\s+de\s+(\d{4})/gi,
        // "julho de 2025"
        /(\w{3,12})\s+de\s+(\d{4})/gi,
      ];

      for (const pattern of datePatterns) {
        const match = new RegExp(pattern).exec(wikitext);
        if (match) {
          data.dates = match[0];
          break;
        }
      }
    }

    // Extract location from content if not found in infobox
    if (!data.location) {
      const locationPatterns = [
        /\*\*Local\*\*:\s*([^|\n]{1,200})/i,
        /Local:\s*([^|\n]{1,200})/i,
        /em\s+([^,]{1,100}),\s+([^|\n]{1,200})/i,
      ];

      for (const pattern of locationPatterns) {
        const match = new RegExp(pattern).exec(wikitext);
        if (match?.[1]) {
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

/**
 * Processes infobox data to extract event information
 */
function processInfoboxData(infobox: any, eventData: Partial<Event>): void {
  if (infobox.description) {
    eventData.description = infobox.description;
  }

  const infoboxDateText = [
    infobox.date,
    infobox.dates,
    infobox.start_date,
    infobox.end_date,
    infobox.when,
    infobox.time,
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

  if (infobox.location) {
    eventData.type_of_location = 'in-person';
  }
}

/**
 * Processes page content to extract missing event information
 */
function processPageContent(content: string, eventData: Partial<Event>): void {
  if (!eventData.description) {
    const description = extractDescriptionFromContent(content);
    if (description) {
      eventData.description = description;
    }
  }

  if (!eventData.time_begin) {
    const dateInfo = extractDatesFromPageContent(content);
    if (dateInfo) {
      eventData.time_begin = dateInfo.time_begin;
      if (dateInfo.time_end) {
        eventData.time_end = dateInfo.time_end;
      }
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
      eventData.type_of_location = 'in-person';
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

export async function fetchEventDataByWikimediaURL(url: string): Promise<Partial<Event> | null> {
  const pageTitle = extractWikimediaTitleFromURL(url);

  if (!pageTitle) {
    console.error('Unable to extract the page title from the URL:', url);
    return null;
  }

  try {
    const pageData = await fetchWikimediaPageData(url);

    if (pageData?.wikidata_qid) {
      const wikidataResult = await fetchEventDataByQID(pageData.wikidata_qid);
      if (wikidataResult) {
        wikidataResult.url = url;
        return wikidataResult;
      }
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
        const simpleDateMatch = new RegExp(/(\d{4})-(\d{2})-(\d{2})/).exec(pageData.dates);
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
