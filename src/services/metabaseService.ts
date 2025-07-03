import { Event } from "@/types/event";

const METABASE_ENDPOINT = "https://metabase.wikibase.cloud/query/sparql";

/**
 * Service for SPARQL queries to the Metabase of Wikibase Cloud
 */


export async function fetchEventDataByQID(
  qid: string
): Promise<Partial<Event> | null> {
  if (!qid || !qid.startsWith("Q")) {
    console.error("QID inválido:", qid);
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
    const response = await fetch(
      `${METABASE_ENDPOINT}?format=json&query=${encodedQuery}`
    );

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    // If there are no results, return null
    if (
      !data.results ||
      !data.results.bindings ||
      data.results.bindings.length === 0
    ) {
      return null;
    }

    const result = data.results.bindings[0];


    // Build the event object with the obtained data
    const eventData: Partial<Event> = {
      name: result.name?.value || "",
      wikidata_qid: qid,
      description: result.description?.value || "",
      image_url: result.image_url?.value || "",
      url: result.url?.value || "",
    };

    // Process dates if available
    if (result.start_date?.value) {
      try {
        eventData.time_begin = new Date(result.start_date.value).toISOString();
      } catch (error) {
        console.error("❌ fetchEventDataByQID - Error processing start_date:", result.start_date.value, error);
      }
    }

    if (result.end_date?.value) {
      try {
        eventData.time_end = new Date(result.end_date.value).toISOString();
      } catch (error) {
        console.error("❌ fetchEventDataByQID - Error processing end_date:", result.end_date.value, error);
      }
    }

    // If we have a location, define the type as in-person
    if (result.location?.value) {
      eventData.type_of_location = "in-person";

      // If it has an OpenStreetMap ID, add it here
      // Note: This requires an additional query or a specific property
    }

    return eventData;
  } catch (error) {
    console.error("Error fetching event data from Metabase:", error);
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


export function extractDatesFromPageContent(pageContent: string): { time_begin: string; time_end?: string } | undefined {
  if (!pageContent) return undefined;

  // Universal patterns for different date formats
  const patterns = [
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
    
    // Single ISO date: "2025-07-19"
    /(\d{4})-(\d{1,2})-(\d{1,2})/gi,
    
    // Single numeric date: "19/07/2025", "19.07.2025"
    /(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})/gi,
    
    // Single American date: "07/19/2025", "07-19-2025"
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/gi
  ];

  // Try each pattern
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const matches = Array.from(pageContent.matchAll(pattern));
    
    for (const match of matches) {
      console.log(`📅 Pattern ${i + 1} matched:`, match);
      
      try {
        let startYear: string = '';
        let startMonth: string = '';
        let startDay: string = '';
        let endYear: string = '';
        let endMonth: string = '';
        let endDay: string = '';

        if (i === 0) {
          // Padrão 1: ISO "YYYY-MM-DD to YYYY-MM-DD"
          [, startYear, startMonth, startDay, endYear, endMonth, endDay] = match;
        } else if (i === 1) {
          // Padrão 2: "DD/MM/YYYY to DD/MM/YYYY" (formato europeu)
          [, startDay, startMonth, startYear, endDay, endMonth, endYear] = match;
        } else if (i === 2) {
          // Padrão 3: "MM/DD/YYYY to MM/DD/YYYY" (formato americano)
          [, startMonth, startDay, startYear, endMonth, endDay, endYear] = match;
        } else if (i === 3) {
          // Padrão 4: "DD-DD/MM/YYYY" (dias consecutivos)
          [, startDay, endDay, startMonth, startYear] = match;
          endYear = startYear;
          endMonth = startMonth;
          
          // Converter ano de 2 dígitos para 4 dígitos se necessário
          if (startYear.length === 2) {
            const year = parseInt(startYear);
            startYear = endYear = year > 50 ? `19${year}` : `20${year}`;
          }
        } else if (i === 4) {
          // Padrão 5: "DD to DD YYYY" (formato simples)
          [, startDay, endDay, startYear] = match;
          endYear = startYear;
          // Assumir mês atual ou janeiro se não especificado
          startMonth = endMonth = "01";
        } else if (i === 5) {
          // Padrão 6: "YYYY-MM-DD" (ISO único)
          [, startYear, startMonth, startDay] = match;
          endYear = startYear;
          endMonth = startMonth;
          endDay = startDay;
        } else if (i === 6) {
          // Padrão 7: "DD/MM/YYYY" (europeu único)
          [, startDay, startMonth, startYear] = match;
          endYear = startYear;
          endMonth = startMonth;
          endDay = startDay;
        } else if (i === 7) {
          // Padrão 8: "MM/DD/YYYY" (americano único)
          [, startMonth, startDay, startYear] = match;
          endYear = startYear;
          endMonth = startMonth;
          endDay = startDay;
        }

        // Validar se temos todos os componentes necessários
        if (startYear && startMonth && startDay && endYear && endMonth && endDay) {
          // Validar se os valores são válidos
          const startYearNum = parseInt(startYear);
          const startMonthNum = parseInt(startMonth);
          const startDayNum = parseInt(startDay);
          const endYearNum = parseInt(endYear);
          const endMonthNum = parseInt(endMonth);
          const endDayNum = parseInt(endDay);

          // Verificações básicas de validade
          if (
            startYearNum >= 2020 && startYearNum <= 2030 &&
            startMonthNum >= 1 && startMonthNum <= 12 &&
            startDayNum >= 1 && startDayNum <= 31 &&
            endYearNum >= 2020 && endYearNum <= 2030 &&
            endMonthNum >= 1 && endMonthNum <= 12 &&
            endDayNum >= 1 && endDayNum <= 31
          ) {
            const startDate = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}T00:00:00.000Z`;
            const endDate = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}T23:59:59.000Z`;

            console.log("✅ extractDatesFromPageContent found dates:", {
              startDay, startMonth, startYear, endDay, endMonth, endYear, startDate, endDate
            });
            
            return {
              time_begin: startDate,
              time_end: endDate
            };
          }
        }
      } catch (error) {
        console.error("❌ Error processing date match:", error, match);
        continue;
      }
    }
  }

  // Fallback: tentar extrair pelo menos o ano e criar datas padrão
  const yearMatch = pageContent.match(/\b(202[0-9]|203[0-9])\b/);
  if (yearMatch) {
    const year = yearMatch[1];
    console.log("📅 extractDatesFromPageContent - Only found year, creating default dates:", year);
    
    return {
      time_begin: `${year}-01-01T00:00:00.000Z`,
      time_end: `${year}-12-31T23:59:59.000Z`
    };
  }

  console.log("❌ extractDatesFromPageContent - No dates found in content");
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
        return decodeURIComponent(match[1].replace(/_/g, " "));
      }
    }

    return undefined;
  } catch (error) {
    console.error("Error extracting title from URL:", error);
    return undefined;
  }
}


export function extractQIDFromURL(url: string): string | undefined {
  if (!url) return undefined;

  try {
    // URL patterns for Wikidata
    const patterns = [
      /wikidata\.org\/wiki\/(Q\d+)/i,
      /wikidata\.org\/entity\/(Q\d+)/i,
      /(Q\d+)$/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return undefined;
  } catch (error) {
    console.error("Error extracting QID from URL:", error);
    return undefined;
  }
}

export async function fetchEventDataByURL(
  url: string
): Promise<Partial<Event> | null> {
  const qid = extractQIDFromURL(url);
  if (!qid) {
    console.error("Unable to extract QID from URL:", url);
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
    const response = await fetch(
      `${METABASE_ENDPOINT}?format=json&query=${encodedQuery}`
    );

    if (!response.ok) {
      throw new Error(`Error in request: ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.results ||
      !data.results.bindings ||
      data.results.bindings.length === 0
    ) {
      return null;
    }

    return data.results.bindings[0];
  } catch (error) {
    console.error("Error fetching location data from Metabase:", error);
    return null;
  }
}

export async function fetchEventDataByWikimediaURL(
  url: string
): Promise<Partial<Event> | null> {
  
  const pageTitle = extractWikimediaTitleFromURL(url);

  if (!pageTitle) {
    console.error("Unable to extract the page title from the URL:", url);
    return null;
  }

  try {
    // Create basic data for events based on the page title
    const lowerPageTitle = pageTitle.toLowerCase();
    const extractedYear = extractYearFromText(pageTitle) || extractYearFromText(url);
    
    const eventData: Partial<Event> = {
      name: pageTitle,
      description: "", // Leave empty for manual editing
      url: url,
    };
    
    if (extractedYear) {
      // Identify event type and define a cleaner name
      if (lowerPageTitle.includes("wikicon")) {
        eventData.name = `Wikicon ${extractedYear}`;
        eventData.type_of_location = "hybrid";
      }
      else if (lowerPageTitle.includes("wikimania")) {
        eventData.name = `Wikimania ${extractedYear}`;
        eventData.type_of_location = "in-person";
      }
      else {
        eventData.type_of_location = "hybrid";
      }
      
      // Leave data fields empty for manual input
      eventData.time_begin = "";
      eventData.time_end = "";
    }

    return eventData;
  } catch (error) {
    console.error("Error fetching event data from Metabase:", error);

    // Fallback for known events
    const lowerPageTitle = pageTitle.toLowerCase();
    const extractedYear = extractYearFromText(pageTitle) || extractYearFromText(url);
    
    // Wikicon
    if (lowerPageTitle.includes("wikicon") && extractedYear) {
      return {
        name: `Wikicon ${extractedYear}`,
        description: "", // Leave empty for manual editing
        time_begin: "", // Leave empty for manual input
        time_end: "", // Leave empty for manual input
        type_of_location: "hybrid",
        url: url,
      };
    }
    
    // Fallback genérico para outros eventos com ano identificado
    if (extractedYear) {
      return {
        name: pageTitle,
        description: "", // Leave empty for manual editing
        time_begin: "", // Leave empty for manual input
        time_end: "", // Leave empty for manual input
        type_of_location: "hybrid",
        url: url,
      };
    }

    return null;
  }
}

export async function fetchEventDataByLearnWikiURL(
  url: string
): Promise<Partial<Event> | null> {
  if (!url || !url.includes("learn.wiki")) return null;

  try {
    // Extract the course code from the URL - corrected to work with WikiLearn URLs
    const courseMatch = url.match(/course-v1:([^/]+)/i);
    if (!courseMatch || !courseMatch[1]) {
      console.error("Unable to extract the course code from the URL:", url);
      return null;
    }

    // Decode the course code correctly
    const courseCode = decodeURIComponent(courseMatch[1]);
    // Divide by '+' instead of spaces, as it comes in the URL
    const courseParts = courseCode.split('+');
    
    if (courseParts.length < 3) {
      console.error("Formato de código de curso inválido:", courseCode);
      return null;
    }

    const [organization, code, year] = courseParts;

    // Create a more descriptive name based on the code
    let courseName = `${code}`;
    let courseDescription = ""; // Leave empty for manual editing

    // Specific known cases for names
    if (code === "DIS001") {
      courseName = "Trust & Safety: Disinformation Training";
    } else if (code.startsWith("TRAIN")) {
      courseName = `${organization.replace(/-/g, ' ')} Training Course`;
    }

    // Leave data fields empty for manual input
    const eventData: Partial<Event> = {
      name: courseName,
      description: courseDescription,
      url: url,
      type_of_location: "virtual",
      time_begin: "", // Leave empty for manual input
      time_end: "", // Leave empty for manual input
    };

    return eventData;
  } catch (error) {
    console.error("Error processing learn.wiki URL:", error);
    return null;
  }
}

export function isValidEventURL(url: string): boolean {
  
  if (!url || typeof url !== 'string') {
    return false;
  }

  const validPatterns = [
    // Meta Wikimedia URLs
    { name: "Meta Wikimedia", pattern: /^https?:\/\/meta\.wikimedia\.org\/wiki\/.+/i },
    // Local Wikimedia URLs (like br.wikimedia.org)
    { name: "Local Wikimedia", pattern: /^https?:\/\/[a-z]{2}\.wikimedia\.org\/wiki\/.+/i },
    // WikiLearn URLs
    { name: "WikiLearn", pattern: /^https?:\/\/app\.learn\.wiki\/learning\/course\/.+/i },
    // Wikidata URLs (for events)
    { name: "Wikidata", pattern: /^https?:\/\/www\.wikidata\.org\/(wiki|entity)\/Q\d+/i },
  ];

  for (const { name, pattern } of validPatterns) {
    const matches = pattern.test(url);
    if (matches) {
      return true;
    }
  }

  return false;
}

export async function fetchEventDataByGenericURL(
  url: string
): Promise<Partial<Event> | null> {
  
  // Validate if the URL is from an accepted source
  if (!isValidEventURL(url)) {
    console.error("❌ URL is not from an accepted source:", url);
    return null;
  }

  // First, try as Wikidata URL
  const qid = extractQIDFromURL(url);
  if (qid) {
    console.log("🔗 Found QID, using fetchEventDataByQID:", qid);
    return fetchEventDataByQID(qid);
  }

  // If it's not a Wikidata URL, try as Wikimedia URL
  if (
    url.includes("wikimedia.org") ||
    url.includes("wikipedia.org") ||
    url.includes("meta.wikimedia.org")
  ) {
    return fetchEventDataByWikimediaURL(url);
  }

  // If it's a learn.wiki URL
  if (url.includes("learn.wiki")) {
    return fetchEventDataByLearnWikiURL(url);
  }

  // If none of the above options work, return null
  console.error(
    "❌ URL not recognized as Wikidata, Wikimedia or learn.wiki:",
    url
  );
  return null;
}