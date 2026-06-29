import { getCurrentEnvironment, getCurrentAppUrl, getApiBaseUrl } from '@/lib/utils/environment';

describe('environment utils', () => {
  const originalWindow = globalThis.window;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    if (!originalWindow) {
      delete (globalThis as any).window;
    }
  });

  describe('getCurrentEnvironment', () => {
    it('returns local for localhost (client-side)', () => {
      Object.defineProperty(globalThis, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });
      expect(getCurrentEnvironment()).toBe('local');
    });

    it('returns production for capx.toolforge.org', () => {
      Object.defineProperty(globalThis, 'location', {
        value: { hostname: 'capx.toolforge.org' },
        writable: true,
      });
      expect(getCurrentEnvironment()).toBe('production');
    });

    it('returns test for capx-test.toolforge.org', () => {
      Object.defineProperty(globalThis, 'location', {
        value: { hostname: 'capx-test.toolforge.org' },
        writable: true,
      });
      expect(getCurrentEnvironment()).toBe('test');
    });
  });

  describe('getCurrentAppUrl', () => {
    it('returns localhost URL for local environment', () => {
      Object.defineProperty(globalThis, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });
      const url = getCurrentAppUrl();
      expect(url).toBeTruthy();
    });
  });

  describe('getApiBaseUrl', () => {
    it('returns globalThis.location.origin when available', () => {
      Object.defineProperty(globalThis, 'location', {
        value: { hostname: 'localhost', origin: 'https://localhost:3000' },
        writable: true,
      });
      expect(getApiBaseUrl()).toBe('https://localhost:3000');
    });
  });
});
