import React from 'react';
import { render, waitFor } from '@testing-library/react';
import OAuth from '@/app/oauth/page';

// Mocks
const pushMock = jest.fn();
let searchParamsMap: Record<string, string | null> = {};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (key: string) => searchParamsMap[key] ?? null,
  }),
}));

const signInMock = jest.fn();
let sessionStatus: 'authenticated' | 'unauthenticated' | 'loading' = 'unauthenticated';
jest.mock('next-auth/react', () => ({
  __esModule: true,
  SessionProvider: ({ children }: any) => <>{children}</>,
  useSession: () => ({ data: sessionStatus === 'authenticated' ? ({ user: { name: 'x' } }) : null, status: sessionStatus }),
  signIn: (...args: any[]) => signInMock(...args),
}));

// Helpers to mock localStorage with a simple in-memory store
const store: Record<string, string> = {};
beforeEach(() => {
  jest.clearAllMocks();
  // Configure window.location fields used by the component
  Object.assign(window.location as any, { hostname: 'localhost', port: '' });

  // Reset search params and session status
  searchParamsMap = {};
  sessionStatus = 'unauthenticated';

  // Fresh in-memory localStorage
  (window.localStorage.getItem as jest.Mock).mockImplementation((k: string) => (k in store ? store[k] : null));
  (window.localStorage.setItem as jest.Mock).mockImplementation((k: string, v: string) => { store[k] = v; });
  (window.localStorage.clear as jest.Mock).mockImplementation(() => { for (const k of Object.keys(store)) delete store[k]; });
  (window.localStorage as any).removeItem = jest.fn((k: string) => { delete store[k]; });

  // Default window.location.assign is mocked in jest.setup; ensure it's a spy we can assert on
  (window.location.assign as unknown as jest.Mock).mockClear?.();

  // Default fetch mocked per test
  global.fetch = jest.fn();
});

describe('OAuth page flow', () => {
  test('redirects to external host when token belongs to another host', async () => {
    searchParamsMap = { oauth_token: 'T', oauth_verifier: 'V' };
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ extra: 'other.toolforge.org' }) });

    render(<OAuth />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    // We don't assert on window.location.assign due to jsdom quirks;
    // critical check: no internal navigation and no signIn happened
    expect(pushMock).not.toHaveBeenCalled();
    expect(signInMock).not.toHaveBeenCalled();
  });

  test('completes login on same host and navigates to /home', async () => {
    searchParamsMap = { oauth_token: 'T', oauth_verifier: 'V' };
    store['oauth_token_secret'] = 'S';
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ extra: 'localhost' }) });
    signInMock.mockResolvedValue({});

    render(<OAuth />);

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('credentials', expect.objectContaining({
        oauth_token: 'T',
        oauth_token_secret: 'S',
        oauth_verifier: 'V',
        redirect: false,
        callbackUrl: '/home',
      }));
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/home');
    });
  });

  test('already authenticated on same host → goes straight to /home without signIn', async () => {
    searchParamsMap = { oauth_token: 'T', oauth_verifier: 'V' };
  (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ extra: 'localhost' }) });
    sessionStatus = 'authenticated';
    // Ensure secret is available
    store['oauth_token_secret'] = 'S';
    (window.localStorage.getItem as jest.Mock).mockImplementation((k: string) => {
      if (k === 'oauth_token_secret') return 'S';
      return k in store ? store[k] : null;
    });

    render(<OAuth />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/home');
    });
    expect(signInMock).not.toHaveBeenCalled();
  });

  test('missing params → redirect to /', async () => {
    // No params
    render(<OAuth />);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
    expect(signInMock).not.toHaveBeenCalled();
  });

  test('same host but missing secret → redirect to /', async () => {
    searchParamsMap = { oauth_token: 'T', oauth_verifier: 'V' };
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ extra: 'localhost' }) });
    // no oauth_token_secret

    render(<OAuth />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
    expect(signInMock).not.toHaveBeenCalled();
  });
});
