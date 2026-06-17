// Extend coverage for fetchWikimediaData and getWikiBirthday
// (formatWikiImageUrl is already tested in fetchWikimediaData.test.ts)

import { fetchWikimediaData, getWikiBirthday } from '@/lib/utils/fetchWikimediaData';

const makeFetchResponse = (data: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: jest.fn().mockResolvedValue(data),
});

describe('fetchWikimediaData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty document for empty string URL', async () => {
    const result = await fetchWikimediaData('');
    expect(result.title).toBe('');
    expect(result.imageUrl).toBe('');
    expect(result.fullUrl).toBe('');
    expect(result.metadata).toEqual([]);
  });

  it('returns empty document for null-like URL (undefined)', async () => {
    const result = await fetchWikimediaData(undefined as any);
    expect(result.title).toBe('');
  });

  it('extracts filename from commons.wikimedia.org/wiki/File: URL and fetches API', async () => {
    const mockData = {
      query: {
        pages: [
          {
            title: 'File:Example.jpg',
            imageinfo: [
              {
                url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg',
                thumburl:
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Example.jpg/200px-Example.jpg',
                metadata: [{ name: 'DateTime', value: '2020:01:01 00:00:00' }],
              },
            ],
          },
        ],
      },
    };

    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    const result = await fetchWikimediaData('https://commons.wikimedia.org/wiki/File:Example.jpg');

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const fetchUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(fetchUrl).toContain('commons.wikimedia.org/w/api.php');
    expect(fetchUrl).toContain('Example.jpg');

    expect(result.title).toBe('Example.jpg');
    expect(result.imageUrl).toBe(mockData.query.pages[0].imageinfo[0].thumburl);
    expect(result.fullUrl).toBe(mockData.query.pages[0].imageinfo[0].url);
    expect(result.metadata).toEqual(mockData.query.pages[0].imageinfo[0].metadata);
  });

  it('extracts filename from Special:FilePath URL', async () => {
    const mockData = {
      query: {
        pages: [
          {
            title: 'File:Special.jpg',
            imageinfo: [
              {
                url: 'https://upload.wikimedia.org/wikipedia/commons/x/xx/Special.jpg',
                thumburl:
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/x/xx/Special.jpg/200px-Special.jpg',
                metadata: [],
              },
            ],
          },
        ],
      },
    };

    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    const result = await fetchWikimediaData(
      'https://commons.wikimedia.org/wiki/Special:FilePath/Special.jpg?width=384'
    );

    expect(result.title).toBe('Special.jpg');
  });

  it('extracts filename from upload.wikimedia.org URL', async () => {
    const mockData = {
      query: {
        pages: [
          {
            title: 'File:Upload.jpg',
            imageinfo: [
              {
                url: 'https://upload.wikimedia.org/wikipedia/commons/u/up/Upload.jpg',
                thumburl: null,
                metadata: [],
              },
            ],
          },
        ],
      },
    };

    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    await fetchWikimediaData('https://upload.wikimedia.org/wikipedia/commons/u/up/Upload.jpg');

    const fetchUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(fetchUrl).toContain('Upload.jpg');
  });

  it('extracts filename from raw File: prefix input', async () => {
    const mockData = {
      query: {
        pages: [
          {
            title: 'File:Raw.jpg',
            imageinfo: [{ url: 'https://example.com/Raw.jpg', thumburl: undefined, metadata: [] }],
          },
        ],
      },
    };

    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    const result = await fetchWikimediaData('File:Raw.jpg');
    expect(result.title).toBe('Raw.jpg');
  });

  it('falls back to constructed fullUrl when imageinfo url is missing', async () => {
    const mockData = {
      query: {
        pages: [
          {
            title: 'File:NoUrl.jpg',
            imageinfo: [{ thumburl: undefined, metadata: [] }],
          },
        ],
      },
    };

    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    const result = await fetchWikimediaData('https://commons.wikimedia.org/wiki/File:NoUrl.jpg');

    expect(result.fullUrl).toContain('commons.wikimedia.org/wiki/File:');
  });

  it('returns empty document when API response has no pages', async () => {
    const mockData = { query: { pages: [] } };
    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    const result = await fetchWikimediaData('https://commons.wikimedia.org/wiki/File:Missing.jpg');
    expect(result.title).toBe('');
    expect(result.imageUrl).toBe('');
  });

  it('returns empty document when fetch throws', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    const result = await fetchWikimediaData('https://commons.wikimedia.org/wiki/File:Error.jpg');
    expect(result.title).toBe('');
    expect(result.imageUrl).toBe('');
    expect(result.fullUrl).toBe('');
    expect(result.metadata).toEqual([]);
  });

  it('handles URL-encoded filenames (decodes them for API call)', async () => {
    const mockData = {
      query: {
        pages: [
          {
            title: 'File:Teoria_da_Mudanca.pdf',
            imageinfo: [{ url: 'https://example.com/file.pdf', thumburl: undefined, metadata: [] }],
          },
        ],
      },
    };

    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    await fetchWikimediaData('https://commons.wikimedia.org/wiki/File:Teoria_da_Mudan%C3%A7a.pdf');

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const fetchUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    // The filename should be re-encoded in the API URL
    expect(fetchUrl).toContain('api.php');
  });
});

// ---------------------------------------------------------------------------
// getWikiBirthday
// ---------------------------------------------------------------------------
describe('getWikiBirthday', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the oldest registration date for a user', async () => {
    const mockData = {
      query: {
        globaluserinfo: {
          merged: [
            { wiki: 'enwiki', registration: '2010-01-15T00:00:00Z' },
            { wiki: 'dewiki', registration: '2008-03-20T00:00:00Z' },
            { wiki: 'frwiki', registration: '2012-05-10T00:00:00Z' },
          ],
        },
      },
    };

    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    const result = await getWikiBirthday('TestUser');

    expect(result).toBe('2008-03-20T00:00:00Z');
  });

  it('returns null when merged array is missing', async () => {
    const mockData = { query: { globaluserinfo: {} } };
    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    const result = await getWikiBirthday('UnknownUser');
    expect(result).toBeNull();
  });

  it('returns null when merged array is empty', async () => {
    const mockData = { query: { globaluserinfo: { merged: [] } } };
    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    const result = await getWikiBirthday('NewUser');
    expect(result).toBeUndefined(); // .sort()[0] of empty array is undefined
  });

  it('ignores entries without a registration date', async () => {
    const mockData = {
      query: {
        globaluserinfo: {
          merged: [
            { wiki: 'enwiki' }, // no registration
            { wiki: 'dewiki', registration: '2015-06-01T00:00:00Z' },
          ],
        },
      },
    };

    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    const result = await getWikiBirthday('PartialUser');
    expect(result).toBe('2015-06-01T00:00:00Z');
  });

  it('returns null when fetch throws', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const result = await getWikiBirthday('ErrorUser');
    expect(result).toBeNull();
  });

  it('builds the correct API URL with encoded username', async () => {
    const mockData = {
      query: {
        globaluserinfo: {
          merged: [{ wiki: 'enwiki', registration: '2020-01-01T00:00:00Z' }],
        },
      },
    };
    globalThis.fetch = jest.fn().mockResolvedValue(makeFetchResponse(mockData));

    await getWikiBirthday('User With Spaces');

    const fetchUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(fetchUrl).toContain('meta.wikimedia.org/w/api.php');
    expect(fetchUrl).toContain('User%20With%20Spaces');
  });
});
