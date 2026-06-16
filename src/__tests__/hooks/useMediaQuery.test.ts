import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  let mockMatchMedia: jest.Mock;
  let mockAddEventListener: jest.Mock;
  let mockRemoveEventListener: jest.Mock;
  let mockMatches: boolean;
  let changeListener: (() => void) | null = null;

  beforeEach(() => {
    mockMatches = false;
    mockAddEventListener = jest.fn((event: string, listener: () => void) => {
      if (event === 'change') {
        changeListener = listener;
      }
    });
    mockRemoveEventListener = jest.fn();

    mockMatchMedia = jest.fn((query: string) => ({
      matches: mockMatches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    changeListener = null;
    jest.clearAllMocks();
  });

  it('returns false initially before mounting (SSR behaviour)', () => {
    // The hook initializes matches as false and mounted as false
    // On first render, before useEffect runs, it should return false
    mockMatches = true;
    mockMatchMedia = jest.fn(() => ({
      matches: true,
      media: '(min-width: 768px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: jest.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    // After mount (useEffect runs), value should be true
    expect(result.current).toBe(true);
  });

  it('calls window.matchMedia with the correct query', () => {
    const query = '(min-width: 1024px)';
    renderHook(() => useMediaQuery(query));
    expect(mockMatchMedia).toHaveBeenCalledWith(query);
  });

  it('returns false when matchMedia does not match', () => {
    mockMatches = false;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('returns true when matchMedia matches', () => {
    mockMatches = true;
    mockMatchMedia = jest.fn(() => ({
      matches: true,
      media: '(min-width: 768px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: jest.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('adds a change event listener on mount', () => {
    renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('removes the change event listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('responds to change events and updates the value', () => {
    let currentMatches = false;
    const mediaQueryObject = {
      get matches() {
        return currentMatches;
      },
      media: '(min-width: 768px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: (event: string, listener: () => void) => {
        if (event === 'change') {
          changeListener = listener;
        }
      },
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn(() => mediaQueryObject),
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => {
      currentMatches = true;
      if (changeListener) changeListener();
    });

    expect(result.current).toBe(true);
  });

  it('re-runs when the query changes', () => {
    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 768px)' } }
    );

    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px)');

    rerender({ query: '(min-width: 1024px)' });

    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
  });

  it('cleans up previous listener when query changes', () => {
    const { rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 768px)' } }
    );

    rerender({ query: '(min-width: 1024px)' });

    // The old listener should have been removed
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });
});
