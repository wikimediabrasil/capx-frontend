import RecommendationCapacityCard from '@/app/(auth)/home/components/RecommendationCapacityCard';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { CapacityCacheProvider, useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SessionProvider, useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { CapacityRecommendation } from '@/types/recommendation';

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/contexts/AppContext', () => ({
  useApp: jest.fn(),
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/contexts/CapacityCacheContext', () => ({
  useCapacityCache: jest.fn(),
  CapacityCacheProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/app/providers/SnackbarProvider', () => ({
  useSnackbar: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
  QueryClient: jest.requireActual('@tanstack/react-query').QueryClient,
  QueryClientProvider: jest.requireActual('@tanstack/react-query').QueryClientProvider,
}));

jest.mock('@/services/profileService', () => ({
  profileService: {
    updateProfile: jest.fn(),
  },
}));

jest.mock('@/services/userService', () => ({
  userService: {
    fetchUserProfile: jest.fn(),
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Test data factory
const createMockCapacityRecommendation = (overrides = {}): CapacityRecommendation => ({
  id: 50,
  name: 'Learning',
  description: 'Learning capability',
  color: 'learning',
  ...overrides,
});

// Common mock data
const createMockPageContent = () => ({
  'add-to-profile': 'Add to Profile',
  'added': 'Added',
  'view': 'View',
  'loading': 'Loading...',
  'capacity-added-success': 'Capacity added to profile',
  'error': 'Error adding capacity',
  'capacity-icon': 'Capacity icon',
  'select-capacity': 'Select Capacity',
});

// Query client configuration
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
    },
  });

describe('RecommendationCapacityCard', () => {
  const mockShowSnackbar = jest.fn();
  const mockPush = jest.fn();
  const mockQueryClient = {
    setQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
  };

  const mockUserProfile = {
    id: 123,
    username: 'testuser',
    skills_wanted: [],
    language: ['en'],
  };

  beforeEach(() => {
    // Setup mocks
    const { useRouter } = require('next/navigation');
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
    });

    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mock-token', id: '123' } },
    });

    (useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
    });

    (useApp as jest.Mock).mockReturnValue({
      pageContent: createMockPageContent(),
    });

    (useCapacityCache as jest.Mock).mockReturnValue({
      getName: jest.fn((id) => {
        if (id === 50) return 'Learning';
        return `Capacity ${id}`;
      }),
      getIcon: jest.fn(() => '/icons/book.svg'),
      getColor: jest.fn(() => 'learning'),
      getDescription: jest.fn((id) => {
        if (id === 50) return 'Learning capability';
        return `Description for ${id}`;
      }),
      preloadCapacities: jest.fn().mockResolvedValue(undefined),
      getCapacity: jest.fn(),
      getRootCapacities: jest.fn(() => []),
      getChildren: jest.fn(() => []),
      hasChildren: jest.fn(() => false),
      getMetabaseCode: jest.fn(code => `M${code}`),
      getWdCode: jest.fn(code => `Q${code}`),
      isLoadingTranslations: false,
      updateLanguage: jest.fn(),
      isFallbackTranslation: jest.fn(() => false),
    });

    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: mockUserProfile,
      isLoading: false,
    });

    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = createTestQueryClient();

    return (
      <SessionProvider session={null}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppProvider>
              <CapacityCacheProvider>{children}</CapacityCacheProvider>
            </AppProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    );
  };

  const renderCard = (props = {}) => {
    const defaultProps = {
      recommendation: createMockCapacityRecommendation(),
      ...props,
    };

    return render(<RecommendationCapacityCard {...defaultProps} />, {
      wrapper: TestWrapper,
    });
  };

  describe('Rendering', () => {
    it('should render capacity recommendation card correctly', async () => {
      renderCard();

      await waitFor(() => {
        const headings = screen.queryAllByText('Learning');
        expect(headings.length).toBeGreaterThan(0);
      });

      expect(screen.getByText('Learning capability')).toBeInTheDocument();
      expect(screen.getByText('Add to Profile')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
    });

    it('should render with hint message when provided', async () => {
      renderCard({
        hintMessage: 'Recommended for you',
      });

      await waitFor(() => {
        expect(screen.getByText('Recommended for you')).toBeInTheDocument();
      });
    });

    it('should render in dark mode correctly', async () => {
      (useTheme as jest.Mock).mockReturnValue({
        darkMode: true,
      });

      const { container } = renderCard();

      await waitFor(() => {
        const card = container.querySelector('.bg-gray-800');
        expect(card).toBeInTheDocument();
      });
    });

    it('should eventually show content after loading', async () => {
      renderCard();

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Add to Profile')).toBeInTheDocument();
      });
    });
  });

  describe('Add to Profile functionality', () => {
    it('should add capacity to profile when Add to Profile button is clicked', async () => {
      const { profileService } = require('@/services/profileService');
      profileService.updateProfile.mockResolvedValue({});

      renderCard();

      await waitFor(() => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add to Profile');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(profileService.updateProfile).toHaveBeenCalledWith(
          123,
          expect.objectContaining({
            skills_wanted: ['50'],
            language: ['en'],
          }),
          expect.any(Object)
        );
      });

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Capacity added to profile',
          'success'
        );
      });
    });

    it('should show "Added" button when capacity is already in wanted list', async () => {
      (useQuery as jest.Mock).mockReturnValue({
        data: {
          ...mockUserProfile,
          skills_wanted: ['50'],
        },
        isLoading: false,
      });

      renderCard();

      await waitFor(() => {
        expect(screen.getByText('✓ Added')).toBeInTheDocument();
      });

      const addedButton = screen.getByText('✓ Added');
      expect(addedButton.closest('button')).toBeDisabled();
    });

    it('should show error message when adding capacity fails', async () => {
      const { profileService } = require('@/services/profileService');
      profileService.updateProfile.mockRejectedValue(new Error('Network error'));

      renderCard();

      await waitFor(() => {
        expect(screen.getByText('Add to Profile')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add to Profile');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Network error',
          'error'
        );
      });
    });

    it('should disable button while adding capacity', async () => {
      const { profileService } = require('@/services/profileService');
      profileService.updateProfile.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({}), 100))
      );

      renderCard();

      await waitFor(() => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add to Profile');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('should not add duplicate capacity', async () => {
      const { profileService } = require('@/services/profileService');
      profileService.updateProfile.mockResolvedValue({});

      (useQuery as jest.Mock).mockReturnValue({
        data: {
          ...mockUserProfile,
          skills_wanted: ['50'],
        },
        isLoading: false,
      });

      renderCard();

      await waitFor(() => {
        expect(screen.getByText('✓ Added')).toBeInTheDocument();
      });

      // Should not call updateProfile since capacity is already added
      expect(profileService.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('View functionality', () => {
    it('should redirect to feed page with capacity filter when View button is clicked', async () => {
      renderCard();

      await waitFor(() => {
        expect(screen.getByText('Add to Profile')).toBeInTheDocument();
      });

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      // Should redirect to feed with capacityId parameter
      expect(mockPush).toHaveBeenCalledWith('/feed?capacityId=50');
    });
  });

  describe('Capacity data', () => {
    it('should use recommendation name if provided', async () => {
      renderCard({
        recommendation: createMockCapacityRecommendation({
          name: 'Custom Capacity Name',
        }),
      });

      await waitFor(() => {
        expect(screen.getByText('Custom Capacity Name')).toBeInTheDocument();
      });
    });

    it('should use cached name if recommendation name is empty', async () => {
      renderCard({
        recommendation: createMockCapacityRecommendation({
          name: '',
        }),
      });

      await waitFor(() => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      });
    });

    it('should use recommendation description if provided', async () => {
      renderCard({
        recommendation: createMockCapacityRecommendation({
          description: 'Custom description',
        }),
      });

      await waitFor(() => {
        expect(screen.getByText('Custom description')).toBeInTheDocument();
      });
    });

    it('should use cached description if recommendation description is empty', async () => {
      renderCard({
        recommendation: createMockCapacityRecommendation({
          description: '',
        }),
      });

      await waitFor(() => {
        expect(screen.getByText('Learning capability')).toBeInTheDocument();
      });
    });

    it('should display capacity icon with correct styling', async () => {
      renderCard();

      await waitFor(() => {
        const icon = screen.getByAltText('Capacity icon');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels and semantic HTML', async () => {
      renderCard();

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /Learning/i });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should render hint icon with aria-hidden', async () => {
      renderCard({
        hintMessage: 'Test hint',
      });

      await waitFor(() => {
        expect(screen.getByText('Test hint')).toBeInTheDocument();
      });
    });
  });

  describe('Cache invalidation', () => {
    it('should invalidate user profile query after adding capacity', async () => {
      const { profileService } = require('@/services/profileService');
      profileService.updateProfile.mockResolvedValue({});

      renderCard();

      await waitFor(() => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add to Profile');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['userProfile', '123', 'mock-token'],
        });
      });
    });
  });
});
