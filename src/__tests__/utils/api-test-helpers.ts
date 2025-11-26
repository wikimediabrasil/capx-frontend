/**
 * API Testing Utilities
 * Helpers for mocking API responses and common test patterns
 */

import { createMockFetchResponse } from './test-helpers';

// Wikidata SPARQL Response Helpers
export const createWikidataBinding = (data: {
  name?: string;
  description?: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  location_name?: string;
  url?: string;
}) => ({
  ...(data.name && { name: { value: data.name } }),
  ...(data.description && { description: { value: data.description } }),
  ...(data.image_url && { image_url: { value: data.image_url } }),
  ...(data.start_date && { start_date: { value: data.start_date } }),
  ...(data.end_date && { end_date: { value: data.end_date } }),
  ...(data.location && { location: { value: data.location } }),
  ...(data.location_name && { location_name: { value: data.location_name } }),
  ...(data.url && { url: { value: data.url } }),
});

export const createWikidataResponse = (bindings: any[]) => ({
  results: { bindings },
});

export const createEmptyWikidataResponse = () => createWikidataResponse([]);

// Wikimedia API Response Helpers
export const createWikimediaPageExtract = (extract: string, pageId = '123') => ({
  query: {
    pages: {
      [pageId]: { extract },
    },
  },
});

export const createWikimediaPageProps = (wikibaseItem: string, pageId = '123') => ({
  query: {
    pages: {
      [pageId]: {
        pageprops: {
          wikibase_item: wikibaseItem,
        },
      },
    },
  },
});

export const createWikimediaRevision = (content: string, pageId = '123') => ({
  query: {
    pages: {
      [pageId]: {
        revisions: [{ '*': content }],
      },
    },
  },
});

// Location/OSM Response Helpers
export const createLocationBinding = (data: {
  name: string;
  lat: string;
  lon: string;
  address: string;
}) => ({
  name: { value: data.name },
  lat: { value: data.lat },
  lon: { value: data.lon },
  address: { value: data.address },
});

// Common test event data
export const createMockEventData = (overrides?: any) => ({
  name: 'Wikimania 2025',
  wikidata_qid: 'Q123456',
  description: 'Annual Wikimedia conference',
  image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/event.jpg',
  url: 'https://meta.wikimedia.org/wiki/Wikimania_2025',
  time_begin: '2025-07-19T00:00:00.000Z',
  time_end: '2025-07-21T23:59:59.000Z',
  type_of_location: 'in-person',
  ...overrides,
});

// Setup fetch mock with multiple responses
export const mockFetchSequence = (...responses: any[]) => {
  const mockFetch = global.fetch as jest.Mock;
  responses.forEach((response) => {
    mockFetch.mockResolvedValueOnce(createMockFetchResponse(response));
  });
};

// Common error response
export const mockFetchError = (error: string = 'API Error') => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(error));
};

// Common failure response
export const mockFetchFailure = () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
  });
};
