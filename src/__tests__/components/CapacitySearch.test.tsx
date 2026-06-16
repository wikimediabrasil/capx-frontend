import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CapacitySearch } from '@/app/(auth)/capacity/components/CapacitySearch';
import { useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from '@/app/providers/SnackbarProvider';
import React from 'react';

// Mock CapacityCard to keep search tests focused
jest.mock('@/app/(auth)/capacity/components/CapacityCard', () => ({
  CapacityCard: ({ name }: { name: string }) => (
    <div data-testid="capacity-card">{name}</div>
  ),
}));

const mockUseDarkMode = jest.fn(() => false);
const mockUseIsMobile = jest.fn(() => false);

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: (...args: any[]) => mockUseDarkMode(...args),
  useSetDarkMode: jest.fn(() => jest.fn()),
  useIsMobile: (...args: any[]) => mockUseIsMobile(...args),
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

// Root capacities used across multiple tests
const rootCapacity = { code: 1, name: 'Test Capacity', color: 'blue', icon: '', level: 1 };
const childCapacity = { code: 2, name: 'Child Capacity', color: 'green', icon: '', level: 2, parentCapacity: { code: 1, color: 'blue' } };
const grandChildCapacity = {
  code: 3,
  name: 'Grandchild Capacity',
  color: 'purple',
  icon: '',
  level: 3,
  parentCapacity: { code: 2, color: 'green', parentCapacity: { code: 1, color: 'blue' } },
};

describe('CapacitySearch', () => {
  const mockSession = {
    data: { user: { token: 'test-token' } },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDarkMode.mockReturnValue(false);
    mockUseIsMobile.mockReturnValue(false);
    (useSession as jest.Mock).mockReturnValue(mockSession);
    mockGetRootCapacities.mockReturnValue([rootCapacity]);
    mockGetChildren.mockReturnValue([]);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

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

  // Helper to type and advance debounce
  const typeAndDebounce = async (input: HTMLElement, value: string) => {
    fireEvent.change(input, { target: { value } });
    await act(async () => { jest.advanceTimersByTime(500); });
  };

  // ----- Basic rendering -----
  it('renders search input correctly', () => {
    renderWithProviders(<CapacitySearch onSearchStart={jest.fn()} onSearchEnd={jest.fn()} />);
    expect(screen.getByPlaceholderText('Search capacities...')).toBeInTheDocument();
  });

  it('renders with compact prop without crashing', () => {
    renderWithProviders(<CapacitySearch compact={true} />);
    expect(screen.getByPlaceholderText('Search capacities...')).toBeInTheDocument();
  });

  it('renders in dark mode without crashing', () => {
    mockUseDarkMode.mockReturnValue(true);
    renderWithProviders(<CapacitySearch />);
    expect(screen.getByPlaceholderText('Search capacities...')).toBeInTheDocument();
  });

  it('renders in mobile mode without crashing', () => {
    mockUseIsMobile.mockReturnValue(true);
    renderWithProviders(<CapacitySearch />);
    expect(screen.getByPlaceholderText('Search capacities...')).toBeInTheDocument();
  });

  // ----- Search behaviour -----
  it('calls getRootCapacities when typing in search input', async () => {
    renderWithProviders(<CapacitySearch onSearchStart={jest.fn()} onSearchEnd={jest.fn()} />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'test');
    await waitFor(() => expect(mockGetRootCapacities).toHaveBeenCalled());
  });

  it('calls onSearchStart when search begins', async () => {
    const onSearchStart = jest.fn();
    renderWithProviders(<CapacitySearch onSearchStart={onSearchStart} onSearchEnd={jest.fn()} />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'test');
    await waitFor(() => expect(onSearchStart).toHaveBeenCalled());
  });

  it('calls onSearch callback with current term', async () => {
    const onSearch = jest.fn();
    renderWithProviders(<CapacitySearch onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('Search capacities...');
    fireEvent.change(input, { target: { value: 'wiki' } });
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('wiki'));
  });

  it('does not fetch root capacities on mount with empty search', () => {
    renderWithProviders(<CapacitySearch onSearchStart={jest.fn()} onSearchEnd={jest.fn()} />);
    expect(mockGetRootCapacities).not.toHaveBeenCalled();
  });

  it('calls onSearchEnd when search is cleared', async () => {
    const onSearchEnd = jest.fn();
    renderWithProviders(<CapacitySearch onSearchEnd={onSearchEnd} />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'test');
    await typeAndDebounce(input, '');
    await waitFor(() => expect(onSearchEnd).toHaveBeenCalled());
  });

  it('does not duplicate search when same term is typed twice', async () => {
    renderWithProviders(<CapacitySearch />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'test');
    const callCount = mockGetRootCapacities.mock.calls.length;
    // Typing the same value again should not trigger another search
    await typeAndDebounce(input, 'test');
    expect(mockGetRootCapacities.mock.calls.length).toBe(callCount);
  });

  // ----- Result display -----
  it('displays search results as CapacityCard when match found', async () => {
    renderWithProviders(<CapacitySearch />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'Test');
    await waitFor(() => expect(screen.getByTestId('capacity-card')).toBeInTheDocument());
    expect(screen.getByText('Test Capacity')).toBeInTheDocument();
  });

  it('shows no results when search term does not match', async () => {
    renderWithProviders(<CapacitySearch />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'zzznomatch');
    await waitFor(() =>
      expect(screen.queryByTestId('capacity-card')).not.toBeInTheDocument()
    );
  });

  it('searches through children of root capacities', async () => {
    mockGetChildren.mockImplementation((code: number) => {
      if (code === 1) return [childCapacity];
      return [];
    });
    renderWithProviders(<CapacitySearch />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'Child');
    await waitFor(() => expect(screen.getByText('Child Capacity')).toBeInTheDocument());
  });

  it('searches through grandchildren', async () => {
    mockGetChildren.mockImplementation((code: number) => {
      if (code === 1) return [childCapacity];
      if (code === 2) return [grandChildCapacity];
      return [];
    });
    renderWithProviders(<CapacitySearch />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'Grand');
    await waitFor(() => expect(screen.getByText('Grandchild Capacity')).toBeInTheDocument());
  });

  it('search is case-insensitive', async () => {
    renderWithProviders(<CapacitySearch />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'TEST CAPACITY');
    await waitFor(() => expect(screen.getByText('Test Capacity')).toBeInTheDocument());
  });

  // ----- Compact view -----
  it('renders compact result as button, not CapacityCard', async () => {
    renderWithProviders(<CapacitySearch compact={true} />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'Test');
    await waitFor(() => expect(screen.getByText('Test Capacity')).toBeInTheDocument());
    // In compact mode, results are rendered as buttons, not CapacityCard
    expect(screen.queryByTestId('capacity-card')).not.toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.some(b => b.textContent?.includes('Test Capacity'))).toBe(true);
  });

  // ----- Selection props -----
  it('renders selected capacity chips when showSelectedChips=true', () => {
    renderWithProviders(
      <CapacitySearch
        showSelectedChips={true}
        selectedCapacities={[{ code: 1, name: 'Selected Cap' }]}
        onSelect={jest.fn()}
      />
    );
    expect(screen.getByText('Selected Cap')).toBeInTheDocument();
  });

  it('does not render chips when showSelectedChips=false', () => {
    renderWithProviders(
      <CapacitySearch
        showSelectedChips={false}
        selectedCapacities={[{ code: 1, name: 'Selected Cap' }]}
        onSelect={jest.fn()}
      />
    );
    expect(screen.queryByText('Selected Cap')).not.toBeInTheDocument();
  });

  it('calls onSelect when remove chip button is clicked', () => {
    const onSelect = jest.fn();
    renderWithProviders(
      <CapacitySearch
        showSelectedChips={true}
        selectedCapacities={[{ code: 1, name: 'Selected Cap' }]}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByLabelText('Remove capacity'));
    expect(onSelect).toHaveBeenCalledWith([]);
  });

  it('calls onSelect with single item on result click (single selection)', async () => {
    const onSelect = jest.fn();
    renderWithProviders(<CapacitySearch onSelect={onSelect} allowMultipleSelection={false} />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'Test');
    await waitFor(() => expect(screen.getByTestId('capacity-card')).toBeInTheDocument());
    // The result is wrapped in a button when onSelect is provided
    const resultButton = screen.getByTestId('capacity-card').closest('button');
    if (resultButton) fireEvent.click(resultButton);
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith([{ code: 1, name: 'Test Capacity' }])
    );
  });

  it('calls onSelect with multiple items on result click (multiple selection)', async () => {
    const onSelect = jest.fn();
    renderWithProviders(
      <CapacitySearch
        onSelect={onSelect}
        allowMultipleSelection={true}
        selectedCapacities={[]}
      />
    );
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'Test');
    await waitFor(() => expect(screen.getByTestId('capacity-card')).toBeInTheDocument());
    const resultButton = screen.getByTestId('capacity-card').closest('button');
    if (resultButton) fireEvent.click(resultButton);
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith([{ code: 1, name: 'Test Capacity' }])
    );
  });

  it('removes already-selected item on click when allowMultipleSelection=true', async () => {
    const onSelect = jest.fn();
    renderWithProviders(
      <CapacitySearch
        onSelect={onSelect}
        allowMultipleSelection={true}
        selectedCapacities={[{ code: 1, name: 'Test Capacity' }]}
      />
    );
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'Test');
    await waitFor(() => expect(screen.getByTestId('capacity-card')).toBeInTheDocument());
    const resultButton = screen.getByTestId('capacity-card').closest('button');
    if (resultButton) fireEvent.click(resultButton);
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith([]));
  });

  it('does not call onSelect when onSelect is not provided', async () => {
    // Should not throw
    renderWithProviders(<CapacitySearch />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'Test');
    await waitFor(() => expect(screen.getByTestId('capacity-card')).toBeInTheDocument());
    // No button wrapper since onSelect is absent — result renders as a div
    expect(screen.queryByRole('button', { name: /Test Capacity/i })).not.toBeInTheDocument();
  });

  // ----- Dark-mode chip styling -----
  it('renders chips in dark mode', () => {
    mockUseDarkMode.mockReturnValue(true);
    renderWithProviders(
      <CapacitySearch
        showSelectedChips={true}
        selectedCapacities={[{ code: 5, name: 'Dark Chip' }]}
        onSelect={jest.fn()}
      />
    );
    expect(screen.getByText('Dark Chip')).toBeInTheDocument();
  });

  // ----- Compact dark-mode result styling -----
  it('renders compact results in dark mode', async () => {
    mockUseDarkMode.mockReturnValue(true);
    renderWithProviders(<CapacitySearch compact={true} />);
    const input = screen.getByPlaceholderText('Search capacities...');
    await typeAndDebounce(input, 'Test');
    await waitFor(() => expect(screen.getByText('Test Capacity')).toBeInTheDocument());
  });
});
