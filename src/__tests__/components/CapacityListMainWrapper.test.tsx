import CapacityListMainWrapper from '@/app/(auth)/capacity/components/CapacityListMainWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { SnackbarProvider } from '@/app/providers/SnackbarProvider';
import React from 'react';

// ---------------------------------------------------------------------------
// Heavy sub-component mocks to isolate CapacityListMainWrapper logic
// ---------------------------------------------------------------------------
jest.mock('@/app/capacities_visualization/components/CapacitiesTreeVisualization', () => ({
  __esModule: true,
  default: () => <div data-testid="tree-visualization">Tree</div>,
}));

jest.mock('@/app/(auth)/capacity/components/CapacityBanner', () => ({
  CapacityBanner: () => <div data-testid="capacity-banner">Banner</div>,
}));

jest.mock('@/app/(auth)/capacity/components/CapacityCategories', () => ({
  __esModule: true,
  default: () => <div data-testid="capacity-categories">Categories</div>,
}));

jest.mock('@/components/LanguageChangeHandler', () => ({
  LanguageChangeHandler: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/CapacityCacheDebug', () => ({
  __esModule: true,
  default: () => <div data-testid="cache-debug">Debug</div>,
}));

jest.mock('@/components/ScrollNavigation', () => ({
  ScrollNavigation: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/app/(auth)/capacity/components/SuggestCapacityModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="suggest-modal">
        <span>Suggest a new capacity</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('@/app/(auth)/capacity/components/CapacitySearch', () => ({
  CapacitySearch: ({
    onSearch,
    onSearchEnd,
  }: {
    onSearch?: (t: string) => void;
    onSearchEnd?: () => void;
  }) => (
    <input
      data-testid="capacity-search"
      placeholder="Search capacities"
      onChange={e => onSearch?.(e.target.value)}
    />
  ),
}));

jest.mock('@/app/(auth)/capacity/components/CapacityCard', () => ({
  CapacityCard: ({ name, isRoot }: { name: string; isRoot?: boolean }) => (
    <div data-testid={isRoot ? 'root-capacity-card' : 'child-capacity-card'}>{name}</div>
  ),
}));

jest.mock('react-simple-typewriter', () => ({
  Typewriter: () => <span data-testid="typewriter" />,
}));

const mockUseDarkMode = jest.fn(() => false);
const mockUseIsMobile = jest.fn(() => false);
const mockUsePageContent = jest.fn(() => ({}));
const mockUseLanguage = jest.fn(() => 'en');

const makeCapacityStoreMock = (overrides: Record<string, any> = {}) => ({
  capacities: {},
  children: {},
  language: 'en',
  timestamp: 0,
  isLoadingTranslations: false,
  isLoaded: true,
  getName: jest.fn((code: number) => ''),
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
  ...overrides,
});

jest.mock('@/stores', () => {
  const { createStoresMock } = require('../helpers/componentTestHelpers');
  const base = createStoresMock({ capacityStore: true });
  // Override with module-level refs so tests can call mockReturnValue on them
  base.useDarkMode = (...args: any[]) => mockUseDarkMode(...args);
  base.useIsMobile = (...args: any[]) => mockUseIsMobile(...args);
  base.usePageContent = (...args: any[]) => mockUsePageContent(...args);
  base.useLanguage = (...args: any[]) => mockUseLanguage(...args);
  // Override capacity store to use local makeCapacityStoreMock (supports isLoaded: true)
  base.useCapacityStore = Object.assign(
    jest.fn((selector?: any) => {
      const state = makeCapacityStoreMock();
      return selector ? selector(state) : state;
    }),
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
  );
  return base;
});

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

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>{ui}</SnackbarProvider>
    </QueryClientProvider>
  );
};

// Helper to mount and fast-forward past the mounting effect
const mountAndSettle = async (ui: React.ReactElement) => {
  const result = renderWithProviders(ui);
  await act(async () => {
    jest.advanceTimersByTime(50);
  });
  return result;
};

describe('CapacityListMainWrapper', () => {
  const mockSession = {
    status: 'authenticated',
    data: { user: { token: 'test-token' } },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue(mockSession);
    mockUseDarkMode.mockReturnValue(false);
    mockUseIsMobile.mockReturnValue(false);
    mockUsePageContent.mockReturnValue({});
    mockUseLanguage.mockReturnValue('en');
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ----- Basic rendering -----
  it('renders root capacities correctly', async () => {
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => expect(screen.getByText('Root Capacity')).toBeInTheDocument());
  });

  it('renders CapacityBanner', async () => {
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => expect(screen.getByTestId('capacity-banner')).toBeInTheDocument());
  });

  it('renders search input', async () => {
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => expect(screen.getByTestId('capacity-search')).toBeInTheDocument());
  });

  it('renders visualization mode switcher', async () => {
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => {
      expect(screen.getByLabelText('Cards view')).toBeInTheDocument();
      expect(screen.getByLabelText('Tree view')).toBeInTheDocument();
      expect(screen.getByLabelText('Other view')).toBeInTheDocument();
    });
  });

  it('shows suggest capacity link', async () => {
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() =>
      expect(screen.getByText("Can't find a capacity? Suggest a new one!")).toBeInTheDocument()
    );
  });

  // ----- Loading states -----
  it('shows loading skeleton when isLoadingRoot is true', () => {
    const mockedHooks = jest.requireMock('@/hooks/useCapacitiesQuery');
    const originalImpl = mockedHooks.useRootCapacities;
    mockedHooks.useRootCapacities = () => ({ data: [], isLoading: true });

    const { container } = renderWithProviders(<CapacityListMainWrapper />);
    // advance past mounted check
    act(() => {
      jest.advanceTimersByTime(50);
    });

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);

    mockedHooks.useRootCapacities = originalImpl;
  });

  it('shows loading translations message when isLoadingTranslations=true and cache not ready', async () => {
    const mockedHooks = jest.requireMock('@/hooks/useCapacitiesQuery');
    const originalRootCapacities = mockedHooks.useRootCapacities;
    mockedHooks.useRootCapacities = () => ({ data: [], isLoading: false });

    const stores = jest.requireMock('@/stores');
    const origStore = stores.useCapacityStore;
    stores.useCapacityStore = Object.assign(
      jest.fn((selector?: any) => {
        const state = makeCapacityStoreMock({ isLoaded: false, isLoadingTranslations: true });
        return selector ? selector(state) : state;
      }),
      { getState: origStore.getState }
    );

    mockUsePageContent.mockReturnValue({
      'capacity-list-loading-translations': 'Loading translations...',
    });

    renderWithProviders(<CapacityListMainWrapper />);
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    await waitFor(() => expect(screen.getByText('Loading translations...')).toBeInTheDocument());

    mockedHooks.useRootCapacities = originalRootCapacities;
    stores.useCapacityStore = origStore;
  });

  // ----- Suggest modal -----
  it('opens suggest modal when clicking suggest link', async () => {
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() =>
      expect(screen.getByText("Can't find a capacity? Suggest a new one!")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Can't find a capacity? Suggest a new one!"));
    await waitFor(() => expect(screen.getByTestId('suggest-modal')).toBeInTheDocument());
  });

  it('closes suggest modal when onClose is called', async () => {
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() =>
      expect(screen.getByText("Can't find a capacity? Suggest a new one!")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Can't find a capacity? Suggest a new one!"));
    await waitFor(() => expect(screen.getByTestId('suggest-modal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => expect(screen.queryByTestId('suggest-modal')).not.toBeInTheDocument());
  });

  // ----- Visualization mode switcher -----
  it('switches to tree view when tree button is clicked', async () => {
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => expect(screen.getByLabelText('Tree view')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Tree view'));
    await waitFor(() => expect(screen.getByTestId('tree-visualization')).toBeInTheDocument());
  });

  it('switches to categories view when categories button is clicked', async () => {
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => expect(screen.getByLabelText('Other view')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Other view'));
    await waitFor(() => expect(screen.getByTestId('capacity-categories')).toBeInTheDocument());
  });

  it('switches back to cards view from tree view', async () => {
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => expect(screen.getByLabelText('Tree view')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Tree view'));
    fireEvent.click(screen.getByLabelText('Cards view'));
    await waitFor(() => expect(screen.queryByTestId('tree-visualization')).not.toBeInTheDocument());
    expect(screen.getByText('Root Capacity')).toBeInTheDocument();
  });

  it('hides visualization switcher when search term is active', async () => {
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => expect(screen.getByTestId('capacity-search')).toBeInTheDocument());
    // Simulate typing in the search input
    fireEvent.change(screen.getByTestId('capacity-search'), { target: { value: 'hello' } });
    await waitFor(() => expect(screen.queryByLabelText('Cards view')).not.toBeInTheDocument());
  });

  it('clears search term when onSearchEnd is called from CapacitySearch', async () => {
    // CapacitySearch mock calls onSearch on change — we verify the switcher comes back after clearing
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => expect(screen.getByTestId('capacity-search')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('capacity-search'), { target: { value: 'hello' } });
    await waitFor(() => expect(screen.queryByLabelText('Cards view')).not.toBeInTheDocument());
    fireEvent.change(screen.getByTestId('capacity-search'), { target: { value: '' } });
    await waitFor(() => expect(screen.getByLabelText('Cards view')).toBeInTheDocument());
  });

  // ----- Dark mode -----
  it('renders in dark mode without crashing', async () => {
    mockUseDarkMode.mockReturnValue(true);
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => expect(screen.getByText('Root Capacity')).toBeInTheDocument());
  });

  // ----- Mobile mode -----
  it('renders in mobile mode without crashing', async () => {
    mockUseIsMobile.mockReturnValue(true);
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => expect(screen.getByText('Root Capacity')).toBeInTheDocument());
  });

  // ----- Multiple root capacities -----
  it('renders multiple root capacities', async () => {
    const mockedHooks = jest.requireMock('@/hooks/useCapacitiesQuery');
    const original = mockedHooks.useRootCapacities;
    mockedHooks.useRootCapacities = () => ({
      data: [
        {
          code: 1,
          name: 'Capacity A',
          color: 'blue',
          icon: '',
          hasChildren: true,
          skill_type: [],
          skill_wikidata_item: '',
        },
        {
          code: 2,
          name: 'Capacity B',
          color: 'red',
          icon: '',
          hasChildren: false,
          skill_type: [],
          skill_wikidata_item: '',
        },
      ],
      isLoading: false,
    });

    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => {
      expect(screen.getByText('Capacity A')).toBeInTheDocument();
      expect(screen.getByText('Capacity B')).toBeInTheDocument();
    });

    mockedHooks.useRootCapacities = original;
  });

  // ----- Error boundary -----
  it('renders error boundary fallback when a child throws', async () => {
    const mockedHooks = jest.requireMock('@/hooks/useCapacitiesQuery');
    const original = mockedHooks.useRootCapacities;
    mockedHooks.useRootCapacities = () => {
      throw new Error('Test error');
    };

    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    renderWithProviders(<CapacityListMainWrapper />);
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    await waitFor(() => expect(screen.getByText('Try again')).toBeInTheDocument());

    consoleError.mockRestore();
    mockedHooks.useRootCapacities = original;
  });

  // ----- pageContent customisation -----
  it('uses pageContent for suggest link label', async () => {
    mockUsePageContent.mockReturnValue({ 'suggest-capacity-link': 'Suggest something' });
    await mountAndSettle(<CapacityListMainWrapper />);
    await waitFor(() => expect(screen.getByText('Suggest something')).toBeInTheDocument());
  });
});
