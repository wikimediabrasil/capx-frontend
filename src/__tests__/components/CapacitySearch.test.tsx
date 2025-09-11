import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CapacitySearch } from '@/app/(auth)/capacity/components/CapacitySearch';
import { useSession } from 'next-auth/react';
import { useCapacityList } from '@/hooks/useCapacityList';
import { CapacityCacheProvider } from '@/contexts/CapacityCacheContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

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

jest.mock('@/contexts/CapacityCacheContext', () => ({
  useCapacityCache: () => ({
    getName: jest.fn((id: number) => `Capacity ${id}`),
    getDescription: jest.fn(),
    getWdCode: jest.fn(),
    getRootCapacities: mockGetRootCapacities,
    getChildren: mockGetChildren,
    isFallbackTranslation: jest.fn(() => false),
  }),
  CapacityCacheProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    isMobile: false,
    language: 'en',
    pageContent: {
      'capacity-search-placeholder': 'Search capacities',
      'capacity-card-expand-capacity': 'Expand capacity',
      'capacity-card-explore-capacity': 'Explore capacity',
      'capacity-card-info': 'Information',
    },
  }),
}));

// ThemeContext mock
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
        <ThemeProvider>
          <CapacityCacheProvider>{ui}</CapacityCacheProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  it('renders search input correctly', () => {
    renderWithProviders(<CapacitySearch onSearchStart={jest.fn()} onSearchEnd={jest.fn()} />);

    expect(screen.getByPlaceholderText('Search capacities')).toBeInTheDocument();
  });

  it('calls fetchCapacitySearch when typing in search input', async () => {
    renderWithProviders(<CapacitySearch onSearchStart={jest.fn()} onSearchEnd={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search capacities');
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

    const searchInput = screen.getByPlaceholderText('Search capacities');
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
