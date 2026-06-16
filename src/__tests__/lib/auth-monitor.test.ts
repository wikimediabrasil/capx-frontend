// Mock next-auth/react BEFORE any imports so the dynamic import inside auth-monitor
// picks up the mock when forceLogout calls getSignOut().
jest.mock('next-auth/react', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}));

import * as nextAuth from 'next-auth/react';
const mockedSignOut = nextAuth.signOut as jest.MockedFunction<typeof nextAuth.signOut>;

// ---------------------------------------------------------------------------
// sessionStorage mock (jest.setup.ts only mocks localStorage)
// ---------------------------------------------------------------------------
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
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// ---------------------------------------------------------------------------
// localStorage override — jest.setup.ts mock lacks removeItem
// ---------------------------------------------------------------------------
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

import {
  startAuthMonitoring,
  stopAuthMonitoring,
  clearAuthState,
  simulateTokenRemoval,
  testTokenExpiration,
} from '@/lib/auth-monitor';

// Helper to set window.location to a non-OAuth path
const setLocation = (pathname: string, search = '') => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      href: '',
      pathname,
      search,
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
    },
  });
};

function mockFetchOk() {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({}),
  });
}

function mockFetch401(body: Record<string, any>) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 401,
    json: jest.fn().mockResolvedValue(body),
  });
}

describe('auth-monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Reset sessionStorage
    sessionStorageMock.getItem.mockImplementation(() => null);
    sessionStorageMock.clear.mockClear();

    // Reset localStorage
    localStorageMock.getItem.mockReturnValue(null);

    // Start from a non-OAuth page with empty href
    setLocation('/home', '');
  });

  afterEach(async () => {
    stopAuthMonitoring();
    // Flush pending timers (e.g. the 2000ms isCheckingAuth reset inside forceLogout)
    // so the module-level flag doesn't leak between tests.
    await jest.runAllTimersAsync();
    jest.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // stopAuthMonitoring
  // -------------------------------------------------------------------------
  describe('stopAuthMonitoring', () => {
    it('can be called when no monitoring is active without error', () => {
      expect(() => stopAuthMonitoring()).not.toThrow();
    });

    it('clears intervals started by startAuthMonitoring', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      stopAuthMonitoring();
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('calling stopAuthMonitoring twice does not throw', () => {
      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      expect(() => {
        stopAuthMonitoring();
        stopAuthMonitoring();
      }).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // startAuthMonitoring - guard conditions
  // -------------------------------------------------------------------------
  describe('startAuthMonitoring - guard conditions', () => {
    it('does nothing when isAuthenticated is false', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      startAuthMonitoring({ isAuthenticated: false, token: 'tok' });
      expect(setIntervalSpy).not.toHaveBeenCalled();
      setIntervalSpy.mockRestore();
    });

    it('does nothing when token is missing', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      startAuthMonitoring({ isAuthenticated: true });
      expect(setIntervalSpy).not.toHaveBeenCalled();
      setIntervalSpy.mockRestore();
    });

    it('starts two intervals when authenticated with a token', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      // one for OAuth tokens / session expiry (2s), one for token validity (30s)
      expect(setIntervalSpy).toHaveBeenCalledTimes(2);
      setIntervalSpy.mockRestore();
    });

    it('stops previous monitoring before starting new one', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      startAuthMonitoring({ isAuthenticated: true, token: 'tok2' });
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('reads initial OAuth tokens from sessionStorage on start', () => {
      sessionStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'oauth_token') return 'ot_abc';
        if (key === 'oauth_token_secret') return 'ots_xyz';
        return null;
      });
      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('oauth_token');
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('oauth_token_secret');
    });
  });

  // -------------------------------------------------------------------------
  // 2-second watcher: session expiration
  // -------------------------------------------------------------------------
  describe('2-second watcher - session expiration', () => {
    it('triggers forceLogout when session is older than 10 days', async () => {
      const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
      const oldTimestamp = Date.now() - TEN_DAYS_MS - 5000;
      localStorageMock.getItem.mockImplementation((key: string) =>
        key === 'login_timestamp' ? String(oldTimestamp) : null
      );
      mockFetchOk();

      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      await jest.advanceTimersByTimeAsync(2001);
      await jest.advanceTimersByTimeAsync(600);

      expect(mockedSignOut).toHaveBeenCalled();
    });

    it('does NOT trigger logout when session is within 10 days', async () => {
      localStorageMock.getItem.mockImplementation((key: string) =>
        key === 'login_timestamp' ? String(Date.now() - 1000) : null
      );
      mockFetchOk();

      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      await jest.advanceTimersByTimeAsync(2001);

      expect(mockedSignOut).not.toHaveBeenCalled();
    });

    it('does NOT trigger logout when no login_timestamp present', async () => {
      mockFetchOk();

      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      await jest.advanceTimersByTimeAsync(2001);

      expect(mockedSignOut).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // 2-second watcher: OAuth token removal detection
  // -------------------------------------------------------------------------
  describe('2-second watcher - OAuth token removal', () => {
    it('triggers forceLogout when OAuth tokens are removed mid-session', async () => {
      sessionStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'oauth_token') return 'token123';
        if (key === 'oauth_token_secret') return 'secret456';
        return null;
      });
      mockFetchOk();

      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      sessionStorageMock.getItem.mockImplementation(() => null);

      await jest.advanceTimersByTimeAsync(2001);
      await jest.advanceTimersByTimeAsync(600);
      expect(mockedSignOut).toHaveBeenCalled();
    });

    it('does NOT trigger logout when OAuth tokens remain present', async () => {
      sessionStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'oauth_token') return 'present_token';
        if (key === 'oauth_token_secret') return 'present_secret';
        return null;
      });
      mockFetchOk();

      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      await jest.advanceTimersByTimeAsync(2001);

      expect(mockedSignOut).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // 30-second watcher: token validity
  // -------------------------------------------------------------------------
  describe('30-second watcher - token validity', () => {
    it.each([
      ['401 with Invalid token', { detail: 'Invalid token.' }],
      ['401 with shouldLogout=true', { shouldLogout: true }],
    ])('triggers forceLogout on %s', async (_label, body) => {
      mockFetch401(body);
      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      await jest.advanceTimersByTimeAsync(30001);
      await jest.advanceTimersByTimeAsync(600);
      expect(mockedSignOut).toHaveBeenCalled();
    });

    it('does NOT logout when token validity returns 200 ok', async () => {
      mockFetchOk();
      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      await jest.advanceTimersByTimeAsync(30001);
      expect(mockedSignOut).not.toHaveBeenCalled();
    });

    it('does NOT logout when 401 response has shouldLogout=false', async () => {
      mockFetch401({ shouldLogout: false });
      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      await jest.advanceTimersByTimeAsync(30001);
      expect(mockedSignOut).not.toHaveBeenCalled();
    });

    it('triggers logout when checkTokenValidity fetch throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      await jest.advanceTimersByTimeAsync(30001);
      await jest.advanceTimersByTimeAsync(600);
      expect(mockedSignOut).toHaveBeenCalled();
    });

    it('triggers logout when session is expired during token check', async () => {
      const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
      localStorageMock.getItem.mockImplementation((key: string) =>
        key === 'login_timestamp' ? String(Date.now() - TEN_DAYS_MS - 1) : null
      );
      mockFetchOk();

      startAuthMonitoring({ isAuthenticated: true, token: 'tok' });
      await jest.advanceTimersByTimeAsync(30001);
      await jest.advanceTimersByTimeAsync(600);
      expect(mockedSignOut).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // clearAuthState
  // -------------------------------------------------------------------------
  describe('clearAuthState', () => {
    it('removes OAuth tokens from sessionStorage', () => {
      clearAuthState();
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('oauth_token');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('oauth_token_secret');
    });

    it('removes auth-related keys from localStorage', () => {
      clearAuthState();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nextauth.message');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('login_timestamp');
    });

    it('clears sessionStorage when not in OAuth login process', () => {
      // Default: pathname='/home', search=''
      clearAuthState();
      expect(sessionStorageMock.clear).toHaveBeenCalled();
    });

    it('does NOT clear sessionStorage when pathname contains /oauth', () => {
      setLocation('/oauth/callback', '');
      clearAuthState();
      expect(sessionStorageMock.clear).not.toHaveBeenCalled();
    });

    it('does NOT clear sessionStorage when oauth_token is in search params', () => {
      setLocation('/home', '?oauth_token=abc');
      clearAuthState();
      expect(sessionStorageMock.clear).not.toHaveBeenCalled();
    });

    it('clears sessionStorage when only oauth_verifier is in search (not oauth_token or /oauth path)', () => {
      // clearApplicationState checks: pathname.includes('/oauth') OR search.includes('oauth_token')
      // oauth_verifier alone does NOT suppress the sessionStorage.clear()
      setLocation('/home', '?oauth_verifier=xyz');
      clearAuthState();
      expect(sessionStorageMock.clear).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // simulateTokenRemoval
  // -------------------------------------------------------------------------
  describe('simulateTokenRemoval', () => {
    it('removes oauth_token and oauth_token_secret from localStorage', () => {
      simulateTokenRemoval();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('oauth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('oauth_token_secret');
    });
  });

  // -------------------------------------------------------------------------
  // testTokenExpiration
  // -------------------------------------------------------------------------
  describe('testTokenExpiration', () => {
    it('calls forceLogout and redirects to /', async () => {
      mockFetchOk();
      const promise = testTokenExpiration();
      await jest.runAllTimersAsync();
      await promise;

      await jest.advanceTimersByTimeAsync(600);
      expect(mockedSignOut).toHaveBeenCalled();
    });
  });
});
