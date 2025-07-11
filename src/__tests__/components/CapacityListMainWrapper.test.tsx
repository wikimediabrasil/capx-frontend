import CapacityListMainWrapper from '@/app/(auth)/capacity/components/CapacityListMainWrapper';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';

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

jest.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    pageContent: {
      'body-capacity-title': 'Capacities',
      'body-capacity-subtitle': 'Explore capacities',
      'capacity-card-expand-capacity': 'Expand capacity',
      'capacity-card-explore-capacity': 'Explore capacity',
      'capacity-card-info': 'Information',
      'capacity-search-placeholder': 'Search capacities',
      loading: 'Loading...',
    },
    language: 'en',
    isMobile: false,
  }),
  AppProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock CapacityDescriptionProvider
jest.mock('@/contexts/CapacityContext', () => ({
  useCapacityDescriptions: () => ({
    getDescription: jest.fn().mockReturnValue('Root description'),
    getWdCode: jest.fn().mockReturnValue('WD123'),
    requestDescription: jest.fn().mockResolvedValue('Root description'),
    isRequested: jest.fn().mockReturnValue(false),
  }),
  CapacityDescriptionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// ThemeContext's mock
jest.mock('@/contexts/ThemeContext', () => {
  const originalModule = jest.requireActual('@/contexts/ThemeContext');
  return {
    ...originalModule,
    useTheme: () => ({
      darkMode: false,
      setDarkMode: jest.fn(),
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

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
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  it('renders root capacities correctly', async () => {
    renderWithProviders(<CapacityListMainWrapper />);

    // Fast-forward the 50ms timer
    jest.advanceTimersByTime(50);

    await waitFor(() => {
      expect(screen.getByText('Root Capacity')).toBeInTheDocument();
    });
  });

  it('expands capacity when clicking arrow button', async () => {
    renderWithProviders(<CapacityListMainWrapper />);

    // Fast-forward the 50ms timer
    jest.advanceTimersByTime(50);

    await waitFor(() => {
      expect(screen.getByText('Root Capacity')).toBeInTheDocument();
    });

    // Find the expand button by aria-label or alt text of the image
    const expandButton = screen.getByAltText('Expand capacity');
    fireEvent.click(expandButton.closest('button') || expandButton);

    // Since we're using mocked data, the child should appear
    await waitFor(() => {
      expect(screen.getByText('Child Capacity')).toBeInTheDocument();
    });
  });

  it('shows capacity description when clicking info button', async () => {
    renderWithProviders(<CapacityListMainWrapper />);

    // Fast-forward the 50ms timer
    jest.advanceTimersByTime(50);

    await waitFor(() => {
      expect(screen.getByText('Root Capacity')).toBeInTheDocument();
    });

    // Find the info button by aria-label
    const infoButton = screen.getByLabelText('Information');
    fireEvent.click(infoButton);

    // Verify that the description is displayed
    await waitFor(() => {
      expect(screen.getByText('Root description')).toBeInTheDocument();
    });
  });

  it('fetches root capacities on mount', async () => {
    renderWithProviders(<CapacityListMainWrapper />);

    // Fast-forward the 50ms timer
    jest.advanceTimersByTime(50);

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
});
