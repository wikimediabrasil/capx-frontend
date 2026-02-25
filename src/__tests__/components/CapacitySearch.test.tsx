import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CapacitySearch } from '@/app/(auth)/capacity/components/CapacitySearch';
import { useSession } from 'next-auth/react';
import { useCapacityList } from '@/hooks/useCapacityList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from '@/app/providers/SnackbarProvider';
import React from 'react';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  useThemeStore: Object.assign(
    jest.fn(() => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() })),
    {
      getState: () => ({
        darkMode: false,
        setDarkMode: jest.fn(),
        mounted: true,
        hydrate: jest.fn(),
      }),
    }
  ),
  useCapacityStore: Object.assign(
    jest.fn(() => ({
      capacities: {},
      children: {},
      language: 'en',
      timestamp: 0,
      isLoadingTranslations: false,
      isLoaded: false,
      getName: jest.fn(() => ''),
      getDescription: jest.fn(() => ''),
      getWdCode: jest.fn(() => ''),
      getMetabaseCode: jest.fn(() => ''),
      getColor: jest.fn(() => '#000'),
      getIcon: jest.fn(() => ''),
      getChildren: jest.fn(() => []),
      getCapacity: jest.fn(() => null),
      getRootCapacities: jest.fn(() => []),
      hasChildren: jest.fn(() => false),
      isFallbackTranslation: jest.fn(() => false),
      getIsLoaded: jest.fn(() => false),
      getIsDescriptionsReady: jest.fn(() => false),
      updateLanguage: jest.fn(),
      preloadCapacities: jest.fn(),
      clearCache: jest.fn(),
      setCache: jest.fn(),
      invalidateQueryCache: jest.fn(),
    })),
    {
      getState: () => ({
        capacities: {},
        children: {},
        language: 'en',
        timestamp: 0,
        isLoadingTranslations: false,
        isLoaded: false,
      }),
    }
  ),
}));

// Next.js App Router's mock
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next-auth/react');

const mockGetRootCapacities = jest
  .fn()
  .mockReturnValue([{ code: 1, name: 'Test Capacity', color: 'blue' }]);
const mockGetChildren = jest.fn().mockReturnValue([]);

// Wire mocks into the capacity store
const storesMock = jest.requireMock('@/stores');
const originalUseCapacityStore = storesMock.useCapacityStore;
storesMock.useCapacityStore = Object.assign(
  jest.fn(() => ({
    ...originalUseCapacityStore(),
    getRootCapacities: mockGetRootCapacities,
    getChildren: mockGetChildren,
  })),
  { getState: originalUseCapacityStore.getState }
);

describe('CapacitySearch', () => {
  const mockSession = {
    data: {
      user: {
        token: 'test-token',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue(mockSession);
    mockGetRootCapacities.mockClear();
    mockGetChildren.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>{ui}</SnackbarProvider>
      </QueryClientProvider>
    );
  };

  it('renders search input correctly', () => {
    renderWithProviders(<CapacitySearch onSearchStart={jest.fn()} onSearchEnd={jest.fn()} />);

    expect(screen.getByPlaceholderText('Search capacities...')).toBeInTheDocument();
  });

  it('calls fetchCapacitySearch when typing in search input', async () => {
    renderWithProviders(<CapacitySearch onSearchStart={jest.fn()} onSearchEnd={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search capacities...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Fast forward the debounce timer within act
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Wait for the search functions to be called
    await waitFor(() => {
      expect(mockGetRootCapacities).toHaveBeenCalled();
    });
  });

  it('calls onSearchStart when search begins', async () => {
    const onSearchStart = jest.fn();
    renderWithProviders(<CapacitySearch onSearchStart={onSearchStart} onSearchEnd={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search capacities...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Fast forward the debounce timer within act
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    // Use waitFor to wait for the debounced call
    await waitFor(() => {
      expect(onSearchStart).toHaveBeenCalled();
    });
  });

  it('does not fetch root capacities on mount with empty search', async () => {
    renderWithProviders(<CapacitySearch onSearchStart={jest.fn()} onSearchEnd={jest.fn()} />);

    // Component should not call getRootCapacities when search term is empty
    expect(mockGetRootCapacities).not.toHaveBeenCalled();
  });
});
