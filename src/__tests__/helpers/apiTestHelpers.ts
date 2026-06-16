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

/**
 * Shorthand for creating an authenticated request with Token header.
 */
export function createAuthenticatedRequest(
  path: string,
  options: Omit<Parameters<typeof createMockNextRequest>[1], 'headers'> & {
    headers?: Record<string, string>;
  } = {}
) {
  return createMockNextRequest(`https://localhost:3000${path}`, {
    ...options,
    headers: { authorization: 'Token test', ...options.headers },
  });
}

/**
 * Generates standard GET route tests (success + error).
 */
export function testGetRoute(config: {
  mockAxios: jest.Mock;
  handler: (...args: any[]) => any;
  path: string;
  axiosData: any;
  expected: any;
  errorMsg: string;
  errorPayload?: any;
  noRequest?: boolean;
}) {
  const {
    mockAxios,
    handler,
    path,
    axiosData,
    expected,
    errorMsg,
    errorPayload = { response: { status: 500 } },
    noRequest = false,
  } = config;

  describe('GET', () => {
    it('returns data', async () => {
      mockAxios.mockResolvedValue({ data: axiosData });
      await handler(noRequest ? undefined : createAuthenticatedRequest(path));
      expect((await import('next/server')).NextResponse.json).toHaveBeenCalledWith(expected);
    });

    it('returns error on failure', async () => {
      mockAxios.mockRejectedValue(errorPayload);
      await handler(noRequest ? undefined : createAuthenticatedRequest(path));
      expect((await import('next/server')).NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: errorMsg }),
        expect.objectContaining({ status: 500 })
      );
    });
  });
}

/**
 * Generates a standard mutation (POST/PUT) success test.
 */
export function testMutationRoute(config: {
  mockAxios: jest.Mock;
  handler: (...args: any[]) => any;
  path: string;
  body: any;
  axiosData: any;
  expected: any;
  label?: string;
}) {
  const { mockAxios, handler, path, body, axiosData, expected, label = 'creates data' } = config;

  it(label, async () => {
    mockAxios.mockResolvedValue({ data: axiosData });
    await handler(createAuthenticatedRequest(path, { body }));
    expect((await import('next/server')).NextResponse.json).toHaveBeenCalledWith(expected);
  });
}
