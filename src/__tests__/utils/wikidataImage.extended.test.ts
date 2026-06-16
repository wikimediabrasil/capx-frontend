// Extend wikidataImage coverage: fetchWikidataImage
// shouldUseWikidataImage is already tested in wikidataImage.test.ts

import { fetchWikidataImage } from '@/lib/utils/wikidataImage';

// sessionStorage mock
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

describe('fetchWikidataImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorageMock.clear();
    sessionStorageMock.getItem.mockImplementation(() => null);
  });

  it('returns image URL when SPARQL returns a result', async () => {
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Photo.jpg';
    const mockData = {
      results: {
        bindings: [{ image: { value: imageUrl } }],
      },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });

    const result = await fetchWikidataImage('Q123456');
    expect(result).toBe(imageUrl);
  });

  it('returns null when SPARQL returns no bindings', async () => {
    const mockData = { results: { bindings: [] } };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });

    const result = await fetchWikidataImage('Q999');
    expect(result).toBeNull();
  });

  it('returns null when fetch throws an error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const result = await fetchWikidataImage('Q000');
    expect(result).toBeNull();
  });

  it('caches result in sessionStorage after successful fetch', async () => {
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Cached.jpg';
    const mockData = {
      results: { bindings: [{ image: { value: imageUrl } }] },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });

    await fetchWikidataImage('Q789');

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'wikidata_img_Q789',
      expect.stringContaining(imageUrl)
    );
  });

  it('caches null result in sessionStorage when no image found', async () => {
    const mockData = { results: { bindings: [] } };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });

    await fetchWikidataImage('Q_no_image');

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'wikidata_img_Q_no_image',
      expect.stringContaining('null')
    );
  });

  it('uses in-memory cache on second call for same QID', async () => {
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/c/c2/InMem.jpg';
    const mockData = {
      results: { bindings: [{ image: { value: imageUrl } }] },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });

    const result1 = await fetchWikidataImage('Q_cached');
    const result2 = await fetchWikidataImage('Q_cached');

    // fetch should only be called once; second call uses in-memory cache
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result1).toBe(imageUrl);
    expect(result2).toBe(imageUrl);
  });

  it('uses sessionStorage cache when in-memory cache is empty', async () => {
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/s/s1/Session.jpg';
    const cachedEntry = JSON.stringify({ url: imageUrl, timestamp: Date.now() });

    // Pre-populate sessionStorage
    sessionStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'wikidata_img_Q_session') return cachedEntry;
      return null;
    });

    global.fetch = jest.fn();

    const result = await fetchWikidataImage('Q_session');

    // Should NOT call fetch when sessionStorage cache is valid
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result).toBe(imageUrl);
  });

  it('refetches when sessionStorage cache is expired', async () => {
    const oldEntry = JSON.stringify({
      url: 'https://old.example.com/old.jpg',
      timestamp: Date.now() - 31 * 60 * 1000, // 31 minutes ago (> 30 min TTL)
    });

    sessionStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'wikidata_img_Q_expired') return oldEntry;
      return null;
    });

    const freshUrl = 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Fresh.jpg';
    const mockData = { results: { bindings: [{ image: { value: freshUrl } }] } };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });

    const result = await fetchWikidataImage('Q_expired');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toBe(freshUrl);
  });

  it('builds the correct SPARQL query URL', async () => {
    const mockData = { results: { bindings: [] } };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });

    await fetchWikidataImage('Q107707826');

    const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(fetchUrl).toContain('query.wikidata.org/sparql');
    expect(fetchUrl).toContain('Q107707826');
    expect(fetchUrl).toContain('format=json');
  });

  it('caches null on fetch error and returns null', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('timeout'));

    const result = await fetchWikidataImage('Q_error');

    expect(result).toBeNull();
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'wikidata_img_Q_error',
      expect.stringContaining('null')
    );
  });
});
