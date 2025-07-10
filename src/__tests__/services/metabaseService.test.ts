import {
  extractDatesFromPageContent,
  extractWikimediaTitleFromURL,
  extractQIDFromURL,
  isValidEventURL,
  extractYearFromText,
  fetchEventDataByQID,
  fetchEventDataByURL,
  fetchLocationByOSMId,
  fetchEventDataByWikimediaURL,
  fetchEventDataByLearnWikiURL,
  fetchEventDataByGenericURL
} from '@/services/metabaseService';

// Mock fetch globally
global.fetch = jest.fn();

describe('MetabaseService - Enhanced Auto-fill', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractDatesFromPageContent', () => {
    it('should extract dates with month names', () => {
      const content = "The event will take place from July 19 to July 21, 2025.";
      const result = extractDatesFromPageContent(content);
      
      expect(result).toBeDefined();
      expect(result?.time_begin).toBe('2025-07-19T00:00:00.000Z');
      expect(result?.time_end).toBe('2025-07-21T23:59:59.000Z');
    });

    it('should extract single date with month name', () => {
      const content = "The conference is scheduled for August 15, 2025.";
      const result = extractDatesFromPageContent(content);
      
      expect(result).toBeDefined();
      expect(result?.time_begin).toBe('2025-08-15T00:00:00.000Z');
      expect(result?.time_end).toBe('2025-08-15T23:59:59.000Z');
    });

    it('should extract consecutive dates', () => {
      const content = "Event dates: 19-21 July 2025";
      const result = extractDatesFromPageContent(content);
      
      expect(result).toBeDefined();
      expect(result?.time_begin).toBe('2025-07-19T00:00:00.000Z');
      expect(result?.time_end).toBe('2025-07-21T23:59:59.000Z');
    });

    it('should extract ISO format dates', () => {
      const content = "From 2025-07-19 to 2025-07-21";
      const result = extractDatesFromPageContent(content);
      
      expect(result).toBeDefined();
      expect(result?.time_begin).toBe('2025-07-19T00:00:00.000Z');
      expect(result?.time_end).toBe('2025-07-21T23:59:59.000Z');
    });

    it('should handle different month formats', () => {
      const content = "September 1-3, 2025";
      const result = extractDatesFromPageContent(content);
      
      expect(result).toBeDefined();
      expect(result?.time_begin).toBe('2025-09-01T00:00:00.000Z');
      expect(result?.time_end).toBe('2025-09-03T23:59:59.000Z');
    });

    it('should return undefined for invalid content', () => {
      const content = "No dates in this content";
      const result = extractDatesFromPageContent(content);
      
      expect(result).toBeUndefined();
    });
  });

  describe('extractWikimediaTitleFromURL', () => {
    it('should extract title from meta.wikimedia.org URL', () => {
      const url = "https://meta.wikimedia.org/wiki/Wikimania_2025";
      const result = extractWikimediaTitleFromURL(url);
      
      expect(result).toBe("Wikimania 2025");
    });

    it('should extract title from local wikimedia URL', () => {
      const url = "https://br.wikimedia.org/wiki/Wikicon_Brasil_2025";
      const result = extractWikimediaTitleFromURL(url);
      
      expect(result).toBe("Wikicon Brasil 2025");
    });

    it('should handle URL encoded titles', () => {
      const url = "https://meta.wikimedia.org/wiki/Event%20with%20spaces";
      const result = extractWikimediaTitleFromURL(url);
      
      expect(result).toBe("Event with spaces");
    });
  });

  describe('extractQIDFromURL', () => {
    it('should extract QID from wikidata URL', () => {
      const url = "https://www.wikidata.org/wiki/Q123456";
      const result = extractQIDFromURL(url);
      
      expect(result).toBe("Q123456");
    });

    it('should extract QID from entity URL', () => {
      const url = "https://www.wikidata.org/entity/Q789012";
      const result = extractQIDFromURL(url);
      
      expect(result).toBe("Q789012");
    });

    it('should return undefined for invalid URL', () => {
      const url = "https://example.com/invalid";
      const result = extractQIDFromURL(url);
      
      expect(result).toBeUndefined();
    });
  });

  describe('isValidEventURL', () => {
    it('should validate Meta Wikimedia URLs', () => {
      const url = "https://meta.wikimedia.org/wiki/Wikimania_2025";
      expect(isValidEventURL(url)).toBe(true);
    });

    it('should validate local Wikimedia URLs', () => {
      const url = "https://br.wikimedia.org/wiki/Event";
      expect(isValidEventURL(url)).toBe(true);
    });

    it('should validate WikiLearn URLs', () => {
      const url = "https://app.learn.wiki/learning/course/course-v1:WikimediaBrasil+TRAIN001+2025";
      expect(isValidEventURL(url)).toBe(true);
    });

    it('should validate Wikidata URLs', () => {
      const url = "https://www.wikidata.org/wiki/Q123456";
      expect(isValidEventURL(url)).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const url = "https://example.com/invalid";
      expect(isValidEventURL(url)).toBe(false);
    });
  });

  describe('extractYearFromText', () => {
    it('should extract year from text', () => {
      const text = "Wikimania 2025 event";
      const result = extractYearFromText(text);
      
      expect(result).toBe(2025);
    });

    it('should extract year from URL', () => {
      const text = "https://meta.wikimedia.org/wiki/Event 2024";
      const result = extractYearFromText(text);
      
      expect(result).toBe(2024);
    });

    it('should return undefined for no year', () => {
      const text = "Event without year";
      const result = extractYearFromText(text);
      
      expect(result).toBeUndefined();
    });
  });

  describe('fetchEventDataByQID', () => {
    it('should fetch event data successfully', async () => {
      const mockResponse = {
        results: {
          bindings: [{
            name: { value: 'Wikimania 2025' },
            description: { value: 'Annual Wikimedia conference' },
            image_url: { value: 'https://commons.wikimedia.org/wiki/Special:FilePath/event.jpg' },
            start_date: { value: '2025-07-19T00:00:00Z' },
            end_date: { value: '2025-07-21T23:59:59Z' },
            location: { value: 'http://www.wikidata.org/entity/Q123' },
            location_name: { value: 'São Paulo' },
            url: { value: 'https://meta.wikimedia.org/wiki/Wikimania_2025' }
          }]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchEventDataByQID('Q123456');

      expect(result).toEqual({
        name: 'Wikimania 2025',
        wikidata_qid: 'Q123456',
        description: 'Annual Wikimedia conference',
        image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/event.jpg',
        url: 'https://meta.wikimedia.org/wiki/Wikimania_2025',
        time_begin: '2025-07-19T00:00:00.000Z',
        time_end: '2025-07-21T23:59:59.000Z',
        type_of_location: 'in-person'
      });
    });

    it('should return null for invalid QID', async () => {
      const result = await fetchEventDataByQID('invalid');
      expect(result).toBeNull();
    });

    it('should return null for empty QID', async () => {
      const result = await fetchEventDataByQID('');
      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await fetchEventDataByQID('Q123456');
      expect(result).toBeNull();
    });

    it('should handle empty results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: { bindings: [] } })
      });

      const result = await fetchEventDataByQID('Q123456');
      expect(result).toBeNull();
    });
  });

  describe('fetchEventDataByURL', () => {
    it('should fetch event data from Wikidata URL', async () => {
      const mockResponse = {
        results: {
          bindings: [{
            name: { value: 'Wikimania 2025' },
            description: { value: 'Annual Wikimedia conference' },
            start_date: { value: '2025-07-19T00:00:00Z' },
            end_date: { value: '2025-07-21T23:59:59Z' }
          }]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchEventDataByURL('https://www.wikidata.org/wiki/Q123456');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Wikimania 2025');
    });

    it('should return null for invalid URL', async () => {
      const result = await fetchEventDataByURL('https://example.com/invalid');
      expect(result).toBeNull();
    });
  });

  describe('fetchLocationByOSMId', () => {
    it('should fetch location data successfully', async () => {
      const mockResponse = {
        results: {
          bindings: [{
            name: { value: 'São Paulo' },
            lat: { value: '-23.5505' },
            lon: { value: '-46.6333' },
            address: { value: 'São Paulo, Brazil' }
          }]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchLocationByOSMId('123456');

      expect(result).toEqual({
        name: { value: 'São Paulo' },
        lat: { value: '-23.5505' },
        lon: { value: '-46.6333' },
        address: { value: 'São Paulo, Brazil' }
      });
    });

    it('should return null for empty OSM ID', async () => {
      const result = await fetchLocationByOSMId('');
      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await fetchLocationByOSMId('123456');
      expect(result).toBeNull();
    });

    it('should handle empty response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: { bindings: [] } })
      });

      const result = await fetchLocationByOSMId('123456');
      expect(result).toBeNull();
    });
  });

  describe('fetchEventDataByWikimediaURL', () => {
    it('should fetch event data from Wikimedia page', async () => {
      // Mock multiple API calls for Wikimedia page data
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            query: {
              pages: {
                '123': {
                  extract: 'Event will take place from July 19 to July 21, 2025'
                }
              }
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            query: {
              pages: {
                '123': {
                  pageprops: {
                    wikibase_item: 'Q123456'
                  }
                }
              }
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            query: {
              pages: {
                '123': {
                  revisions: [{
                    '*': '{{Infobox event\n|name=Wikimania 2025\n|date=July 19-21, 2025\n|location=São Paulo}}'
                  }]
                }
              }
            }
          })
        });

      const result = await fetchEventDataByWikimediaURL('https://meta.wikimedia.org/wiki/Wikimania_2025');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Wikimania 2025');
    });

    it('should return null when page data is not available', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      const result = await fetchEventDataByWikimediaURL('https://meta.wikimedia.org/wiki/InvalidEvent');

      expect(result).toEqual({
        name: 'InvalidEvent',
        url: 'https://meta.wikimedia.org/wiki/InvalidEvent'
      });
    });
  });

  describe('fetchEventDataByLearnWikiURL', () => {
    it('should fetch event data from Learn Wiki page', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          title: 'Wikimedia Training Course',
          description: 'Learn about Wikimedia projects',
          dates: 'August 1-3, 2025'
        })
      });

      const result = await fetchEventDataByLearnWikiURL('https://app.learn.wiki/learning/course/course-v1:WikimediaBrasil+TRAIN001+2025');

      expect(result).toBeDefined();
      expect(result?.name).toBe('TRAIN001 Course');
      expect(result?.description).toBe('Online training course from WikimediaBrasil.');
    });

    it('should return null when page content is not available', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      const result = await fetchEventDataByLearnWikiURL('https://app.learn.wiki/invalid/course');

      expect(result).toBeNull();
    });
  });

  describe('fetchEventDataByGenericURL', () => {
    it('should fetch event data from Wikimedia URL', async () => {
      // Mock Wikimedia API calls
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            query: {
              pages: {
                '123': {
                  extract: 'Event will take place from July 19 to July 21, 2025'
                }
              }
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            query: {
              pages: {
                '123': {
                  pageprops: {
                    wikibase_item: 'Q123456'
                  }
                }
              }
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            query: {
              pages: {
                '123': {
                  revisions: [{
                    '*': '{{Infobox event\n|name=Wikimania 2025\n|date=July 19-21, 2025}}'
                  }]
                }
              }
            }
          })
        });

      const result = await fetchEventDataByGenericURL('https://meta.wikimedia.org/wiki/GenericEvent');

      expect(result).toBeDefined();
      expect(result?.name).toBe('GenericEvent');
    });

    it('should try Learn Wiki if Wikimedia fails', async () => {
      // Mock Wikimedia failure
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false
        })
        // Mock Learn Wiki success
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            title: 'Learn Wiki Event',
            description: 'A Learn Wiki event',
            dates: 'August 1-3, 2025'
          })
        });

      const result = await fetchEventDataByGenericURL('https://app.learn.wiki/learning/course/course-v1:WikimediaBrasil+TRAIN001+2025');

      expect(result).toBeDefined();
      expect(result?.name).toBe('TRAIN001 Course');
      expect(result?.description).toBe('Online training course from WikimediaBrasil.');
    });

    it('should return null when all methods fail', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      const result = await fetchEventDataByGenericURL('https://example.com/invalid');

      expect(result).toBeNull();
    });
  });
}); 