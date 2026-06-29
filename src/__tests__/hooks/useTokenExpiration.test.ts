import { renderHook, act } from '@testing-library/react';
import { useTokenExpiration } from '@/hooks/useTokenExpiration';

const mockPush = jest.fn();
const mockSignOut = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { token: 'test-token', name: 'testuser' } },
    status: 'authenticated',
  })),
  signOut: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Pull in the mocked modules after jest.mock calls
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const mockUseSession = useSession as jest.Mock;
const mockSignOutFn = signOut as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('useTokenExpiration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockReset();
    mockSignOutFn.mockReset();
    mockSignOutFn.mockResolvedValue(undefined);

    mockUseSession.mockReturnValue({
      data: { user: { token: 'test-token', name: 'testuser' } },
      status: 'authenticated',
    });

    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    });
  });

  it('returns isAuthenticated true when status is authenticated', () => {
    const { result } = renderHook(() => useTokenExpiration());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('returns isAuthenticated false when status is unauthenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useTokenExpiration());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('returns the token from the session', () => {
    const { result } = renderHook(() => useTokenExpiration());
    expect(result.current.token).toBe('test-token');
  });

  it('returns undefined token when session has no user', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useTokenExpiration());
    expect(result.current.token).toBeUndefined();
  });

  it('exposes handleTokenExpiration and checkTokenValidity functions', () => {
    const { result } = renderHook(() => useTokenExpiration());
    expect(typeof result.current.handleTokenExpiration).toBe('function');
    expect(typeof result.current.checkTokenValidity).toBe('function');
  });

  describe('handleTokenExpiration', () => {
    it('calls signOut and redirects when authenticated', async () => {
      const { result } = renderHook(() => useTokenExpiration());

      await act(async () => {
        await result.current.handleTokenExpiration();
      });

      expect(mockSignOutFn).toHaveBeenCalledWith({ redirect: false });
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('does not call signOut when not authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useTokenExpiration());

      await act(async () => {
        await result.current.handleTokenExpiration();
      });

      expect(mockSignOutFn).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('falls back to window.location.href on signOut error', async () => {
      mockSignOutFn.mockRejectedValue(new Error('signOut failed'));

      const { result } = renderHook(() => useTokenExpiration());

      await act(async () => {
        await result.current.handleTokenExpiration();
      });

      expect(globalThis.location.href).toBe('/');
    });
  });

  describe('checkTokenValidity', () => {
    it('returns true when response is not a 401', async () => {
      const { result } = renderHook(() => useTokenExpiration());

      let isValid: boolean | undefined;
      await act(async () => {
        isValid = await result.current.checkTokenValidity({ status: 200, data: {} });
      });

      expect(isValid).toBe(true);
    });

    it('returns false and calls handleTokenExpiration on 401 with Invalid token', async () => {
      const { result } = renderHook(() => useTokenExpiration());

      let isValid: boolean | undefined;
      await act(async () => {
        isValid = await result.current.checkTokenValidity({
          status: 401,
          data: { detail: 'Invalid token.' },
        });
      });

      expect(isValid).toBe(false);
      expect(mockSignOutFn).toHaveBeenCalledWith({ redirect: false });
    });

    it('returns true on 401 with a different detail message', async () => {
      const { result } = renderHook(() => useTokenExpiration());

      let isValid: boolean | undefined;
      await act(async () => {
        isValid = await result.current.checkTokenValidity({
          status: 401,
          data: { detail: 'Authentication credentials were not provided.' },
        });
      });

      expect(isValid).toBe(true);
    });

    it('returns true when response is undefined', async () => {
      const { result } = renderHook(() => useTokenExpiration());

      let isValid: boolean | undefined;
      await act(async () => {
        isValid = await result.current.checkTokenValidity(undefined);
      });

      expect(isValid).toBe(true);
    });

    it('returns true when response has no data', async () => {
      const { result } = renderHook(() => useTokenExpiration());

      let isValid: boolean | undefined;
      await act(async () => {
        isValid = await result.current.checkTokenValidity({ status: 401 });
      });

      expect(isValid).toBe(true);
    });
  });
});
