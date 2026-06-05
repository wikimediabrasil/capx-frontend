import { Event } from '@/types/event';

const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

/**
 * Parses a Wikidata date string to an ISO string.
 * Wikidata SPARQL returns dates with a leading '+' (e.g. "+2026-03-08T00:00:00Z")
 * which is not a valid ISO 8601 date for the JS Date constructor.
 */
function parseWikidataDate(raw: string): string | null {
  if (!raw) return null;
  // Strip leading '+' or '-' sign (negative = BCE, which we don't support)
  const cleaned = raw.startsWith('+') ? raw.slice(1) : raw;
  const date = new Date(cleaned);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Fetches event data from Wikidata using SPARQL.
 * Uses P580 (start time), P582 (end time), P276 (location), P856 (official website).
 */
export async function fetchEventFromWikidata(qid: string): Promise<Partial<Event> | null> {
  if (!qid?.startsWith('Q')) return null;

  const query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX schema: <http://schema.org/>

    SELECT ?name ?description ?start_date ?end_date ?location ?url WHERE {
      wd:${qid} rdfs:label ?name .
      FILTER(LANG(?name) = "en")

      OPTIONAL { wd:${qid} schema:description ?description . FILTER(LANG(?description) = "en") }
      OPTIONAL { wd:${qid} wdt:P580 ?start_date . }
      OPTIONAL { wd:${qid} wdt:P582 ?end_date . }
      OPTIONAL { wd:${qid} wdt:P276 ?location . }
      OPTIONAL { wd:${qid} wdt:P856 ?url . }
    }
    LIMIT 1
  `;

  try {
    const response = await fetch(
      `${WIKIDATA_SPARQL_ENDPOINT}?format=json&query=${encodeURIComponent(query)}`,
      { headers: { Accept: 'application/sparql-results+json' } }
    );

    if (!response.ok) throw new Error(`Wikidata SPARQL error: ${response.status}`);

    const data = await response.json();
    if (!data.results?.bindings?.length) return null;

    const result = data.results.bindings[0];

    const eventData: Partial<Event> = {
      name: result.name?.value || '',
      wikidata_qid: qid,
      description: result.description?.value || '',
      url: result.url?.value || '',
    };

    if (result.start_date?.value) {
      const parsed = parseWikidataDate(result.start_date.value);
      if (parsed) eventData.time_begin = parsed;
    }

    if (result.end_date?.value) {
      const parsed = parseWikidataDate(result.end_date.value);
      if (parsed) eventData.time_end = parsed;
    }

    if (result.location?.value) {
      eventData.type_of_location = 'in_person';
    }

    return eventData;
  } catch (error) {
    console.error('Error fetching event from Wikidata:', error);
    return null;
  }
}

/**
 * Finds the Wikidata QID for a Meta wiki page title using the sitelinks API.
 * Returns null if no item is found.
 */
export async function findWikidataQIDByMetaWikiTitle(pageTitle: string): Promise<string | null> {
  if (!pageTitle) return null;

  const cleanTitle = pageTitle.replaceAll(' ', '_');

  try {
    const response = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&sites=metawiki&titles=${encodeURIComponent(cleanTitle)}&format=json&origin=*&props=info`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const entities = data.entities;
    if (!entities) return null;

    const qid = Object.keys(entities)[0];
    // '-1' means no item was found
    return qid && qid !== '-1' ? qid : null;
  } catch (error) {
    console.error('Error looking up Wikidata QID by metawiki title:', error);
    return null;
  }
}
