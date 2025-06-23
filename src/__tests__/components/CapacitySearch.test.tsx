import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CapacitySearch } from '@/app/(auth)/capacity/components/CapacitySearch';
import { useSession } from 'next-auth/react';
import { useCapacityList } from '@/hooks/useCapacityList';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
jest.mock('@/hooks/useCapacityList');
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

  const mockCapacityList = {
    searchResults: [],
    setSearchResults: jest.fn(),
    descriptions: {},
    wdCodes: {},
    findParentCapacity: jest.fn(),
    fetchCapacityDescription: jest.fn(),
    fetchCapacitySearch: jest.fn(),
    fetchRootCapacities: jest.fn(),
    fetchCapacitiesByParent: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue(mockSession);
    (useCapacityList as jest.Mock).mockReturnValue(mockCapacityList);
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  it('renders search input correctly', () => {
    renderWithProviders(<CapacitySearch onSearchStart={jest.fn()} onSearchEnd={jest.fn()} />);

    expect(screen.getByPlaceholderText('Search capacities')).toBeInTheDocument();
  });

  it('calls fetchCapacitySearch when typing in search input', async () => {
    renderWithProviders(<CapacitySearch onSearchStart={jest.fn()} onSearchEnd={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search capacities');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Use waitFor to wait for the debounced call
    await waitFor(() => {
      expect(mockCapacityList.fetchCapacitySearch).toHaveBeenCalledWith('test');
    });
  });

  it('calls onSearchStart when search begins', async () => {
    const onSearchStart = jest.fn();
    renderWithProviders(<CapacitySearch onSearchStart={onSearchStart} onSearchEnd={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search capacities');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Use waitFor to wait for the debounced call
    await waitFor(() => {
      expect(onSearchStart).toHaveBeenCalled();
    });
  });

  it('fetches root capacities on mount', () => {
    renderWithProviders(<CapacitySearch onSearchStart={jest.fn()} onSearchEnd={jest.fn()} />);

    expect(mockCapacityList.fetchRootCapacities).toHaveBeenCalled();
  });
});
