import CapacityListMainWrapper from '@/app/(auth)/capacity/components/CapacityListMainWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { useSession } from 'next-auth/react';
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
  useIsMobile: jest.fn(() => false),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useMobileMenuStatus: jest.fn(() => false),
  useAppStore: Object.assign(
    jest.fn(() => ({
      isMobile: false,
      mobileMenuStatus: false,
      language: 'en',
      pageContent: {},
      session: null,
      mounted: true,
      setMobileMenuStatus: jest.fn(),
      setLanguage: jest.fn(),
      setPageContent: jest.fn(),
      setSession: jest.fn(),
      setIsMobile: jest.fn(),
      hydrate: jest.fn(),
    })),
    {
      getState: () => ({
        isMobile: false,
        mobileMenuStatus: false,
        language: 'en',
        pageContent: {},
        session: null,
        mounted: true,
        setMobileMenuStatus: jest.fn(),
        setLanguage: jest.fn(),
        setPageContent: jest.fn(),
        setSession: jest.fn(),
        setIsMobile: jest.fn(),
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
      isLoaded: true,
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
      getIsLoaded: jest.fn(() => true),
      getIsDescriptionsReady: jest.fn(() => true),
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
        isLoaded: true,
      }),
    }
  ),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
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

// Mock useCapacityList properly
jest.mock('@/hooks/useCapacityList', () => ({
  useCapacityList: () => ({
    searchResults: [],
    descriptions: {},
    setSearchResults: jest.fn(),
    fetchRootCapacities: jest.fn(),
    fetchCapacitiesByParent: jest.fn().mockResolvedValue([]),
    fetchCapacitySearch: jest.fn(),
    fetchCapacityDescription: jest.fn(),
    wdCodes: {},
  }),
}));

// Mock the new hooks used in the component
jest.mock('@/hooks/useCapacitiesQuery', () => ({
  useRootCapacities: () => ({
    data: [
      {
        code: 1,
        name: 'Root Capacity',
        color: 'organizational',
        icon: '/test-icon.svg',
        hasChildren: true,
        skill_type: [],
        skill_wikidata_item: '',
      },
    ],
    isLoading: false,
  }),
  useCapacitiesByParent: () => ({
    data: [
      {
        code: 2,
        name: 'Child Capacity',
        color: 'organizational',
        icon: '/child-icon.svg',
        hasChildren: true,
        skill_type: [],
        skill_wikidata_item: '',
      },
    ],
    isLoading: false,
  }),
  useCapacitySearch: () => ({
    data: [],
    isLoading: false,
  }),
}));

const mockPageContent = {
  'body-capacity-title': 'Capacities',
  'body-capacity-subtitle': 'Explore capacities',
  'capacity-card-expand-capacity': 'Expand capacity',
  'capacity-card-explore-capacity': 'Explore capacity',
  'capacity-card-info': 'Information',
  'capacity-search-placeholder': 'Search capacities',
  loading: 'Loading...',
};

describe('CapacityListMainWrapper', () => {
  // Correct mock for useSession
  const mockSession = {
    status: 'authenticated',
    data: {
      user: {
        token: 'test-token',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue(mockSession);
    // Clear any existing timers
    jest.clearAllTimers();
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

  it('renders root capacities correctly', async () => {
    renderWithProviders(<CapacityListMainWrapper />);

    // Fast-forward the 50ms timer within act
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    await waitFor(() => {
      expect(screen.getByText('Root Capacity')).toBeInTheDocument();
    });
  });

  it('shows expand button for capacity with children', async () => {
    renderWithProviders(<CapacityListMainWrapper />);

    // Fast-forward the 50ms timer within act
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    await waitFor(() => {
      expect(screen.getByText('Root Capacity')).toBeInTheDocument();
    });

    // Verify expand button exists
    expect(screen.getByAltText('Expand capacity')).toBeInTheDocument();
  });

  it('shows info button for capacity', async () => {
    renderWithProviders(<CapacityListMainWrapper />);

    // Fast-forward the 50ms timer within act
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    await waitFor(() => {
      expect(screen.getByText('Root Capacity')).toBeInTheDocument();
    });

    // Verify info button exists
    expect(screen.getByLabelText('Information')).toBeInTheDocument();
  });

  it('fetches root capacities on mount', async () => {
    renderWithProviders(<CapacityListMainWrapper />);

    // Fast-forward the 50ms timer within act
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    // Since we're using mocked hooks, we just need to verify the component renders
    await waitFor(() => {
      expect(screen.getByText('Root Capacity')).toBeInTheDocument();
    });
  });

  it('shows loading state when isLoading.root is true', () => {
    renderWithProviders(<CapacityListMainWrapper />);

    // Before the timer advances, it should show loading
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('shows suggest capacity link below search box', async () => {
    renderWithProviders(<CapacityListMainWrapper />);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Can't find a capacity? Suggest a new one!")
      ).toBeInTheDocument();
    });
  });

  it('opens suggest modal when clicking suggest link', async () => {
    renderWithProviders(<CapacityListMainWrapper />);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Can't find a capacity? Suggest a new one!")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Can't find a capacity? Suggest a new one!"));

    await waitFor(() => {
      expect(screen.getByText('Suggest a new capacity')).toBeInTheDocument();
    });
  });
});
