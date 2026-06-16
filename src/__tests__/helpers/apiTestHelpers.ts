/**
 * Creates a mock NextRequest for API route testing.
 * @param defaultUrl - The default URL if none specified in options
 */
export function createMockNextRequest(
  defaultUrl: string,
  options: {
    method?: string;
    url?: string;
    searchParams?: Record<string, string>;
    headers?: Record<string, string>;
    body?: any;
  } = {}
) {
  const url = new URL(options.url || defaultUrl);
  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return {
    method: options.method || 'GET',
    url: url.toString(),
    nextUrl: url,
    headers: {
      get: jest.fn((name: string) => {
        if (!options.headers) return null;
        const lower = name.toLowerCase();
        const key = Object.keys(options.headers).find(k => k.toLowerCase() === lower);
        return key ? options.headers[key] : null;
      }),
    },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

/**
 * Standard beforeEach setup for API route tests.
 */
export function setupApiTest(baseUrl = 'https://test-api.com') {
  jest.clearAllMocks();
  process.env.BASE_URL = baseUrl;
}
