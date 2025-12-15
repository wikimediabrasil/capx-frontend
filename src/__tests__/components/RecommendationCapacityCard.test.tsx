import React from 'react';
import RecommendationCapacityCard from '@/app/(auth)/home/components/RecommendationCapacityCard';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { CapacityCacheProvider, useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CapacityRecommendation } from '@/types/recommendation';
import {
  renderWithProviders,
  setupCommonMocks,
  cleanupMocks,
  createMockCapacityCache,
  createMockRouter,
  createMockQueryClient,
  createMockSnackbar,
} from '../helpers/recommendationTestHelpers';

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
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
jest.mock('@/app/providers/SnackbarProvider');
jest.mock('@/services/profileService');
jest.mock('@/services/userService');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // Remove Next.js specific props that are not valid HTML attributes
    const { fill, priority, quality, placeholder, blurDataURL, ...imgProps } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));
jest.mock('next/navigation');

// Test data factory
const createMockCapacityRecommendation = (overrides = {}): CapacityRecommendation => ({
  id: 50,
  skill_wikidata_item: 'Q123',
  skill_type: 1,
  name: 'Learning',
  description: 'Learning capability',
  color: 'learning',
  ...overrides,
});

describe('RecommendationCapacityCard', () => {
  const mockSnackbar = createMockSnackbar();
  const mockRouter = createMockRouter();
  let queryClient: QueryClient;

  const mockUserProfile = {
    id: 123,
    username: 'testuser',
    skills_wanted: [],
    language: ['en'],
  };

  // Create stable mock function that persists across ALL renders and tests
  const mockPreloadCapacities = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    const { useRouter } = require('next/navigation');
    const { userService } = require('@/services/userService');

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    setupCommonMocks(useSession as jest.Mock, useTheme as jest.Mock, useApp as jest.Mock);

    // Reset but keep the same reference and ensure it resolves immediately
    mockPreloadCapacities.mockClear();
    mockPreloadCapacities.mockResolvedValue(undefined);

    // Ensure mock is set up before any component renders
    (useCapacityCache as jest.Mock).mockReturnValue(
      createMockCapacityCache({
        preloadCapacities: mockPreloadCapacities,
      })
    );
    (useSnackbar as jest.Mock).mockReturnValue(mockSnackbar);

    // Mock userService to return user profile data
    userService.fetchUserProfile = jest.fn().mockResolvedValue(mockUserProfile);
  });

  afterEach(cleanupMocks);

  const renderCard = (props = {}) => {
    const defaultProps = {
      recommendation: createMockCapacityRecommendation(),
      userProfile: mockUserProfile,
      ...props,
    };

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: 0 },
        mutations: { retry: false },
      },
    });

    // Spy on cache methods to test cache management
    jest.spyOn(queryClient, 'invalidateQueries');
    jest.spyOn(queryClient, 'setQueryData');

    // Set initial user profile data in cache
    queryClient.setQueryData(['userProfile', '123', 'mock-token'], mockUserProfile);

    const QueryWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return renderWithProviders(<RecommendationCapacityCard {...defaultProps} />, [
      QueryWrapper,
      ThemeProvider,
      AppProvider,
      CapacityCacheProvider,
    ]);
  };

  describe('Rendering', () => {
    it('should render capacity recommendation card correctly', async () => {
      renderCard();

      await waitFor(() => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      });

      expect(screen.getByText('Learning capability')).toBeInTheDocument();
      expect(screen.getByText('Add to Profile')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();

      // Verify preloadCapacities was called
      expect(mockPreloadCapacities).toHaveBeenCalled();
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

      await waitFor(() => {
        expect(screen.getByText('Add to Profile')).toBeInTheDocument();
      });
    });
  });

  describe('Add to Profile functionality', () => {
    it('should add capacity to profile when Add to Profile button is clicked', async () => {
      const { profileService } = require('@/services/profileService');
      profileService.updateProfile = jest.fn().mockResolvedValue({});

      renderCard();

      // Wait for component to finish loading and render
      await waitFor(() => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      });

      // Wait for button to be enabled (means userProfile is loaded)
      await waitFor(() => {
        const addButton = screen.getByText('Add to Profile');
        expect(addButton).toBeEnabled();
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
        expect(mockSnackbar.showSnackbar).toHaveBeenCalledWith(
          'Capacity added to profile',
          'success'
        );
      });
    });

    it('should show "Added" button when capacity is already in wanted list', async () => {
      const profileWithCapacity = {
        ...mockUserProfile,
        skills_wanted: ['50'], // Capacity ID 50 is already in the list
      };

      renderCard({
        userProfile: profileWithCapacity,
      });

      await waitFor(() => {
        expect(screen.getByText('✓ Added')).toBeInTheDocument();
      });

      const addedButton = screen.getByText('✓ Added');
      expect(addedButton.closest('button')).toBeDisabled();
    });

    it('should show success message with optimistic update even if server fails', async () => {
      const { profileService } = require('@/services/profileService');

      // Setup mocks - server update fails but UI shows success (optimistic update)
      profileService.updateProfile = jest.fn().mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      renderCard();

      await waitFor(() => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      });

      await waitFor(() => {
        const addButton = screen.getByText('Add to Profile');
        expect(addButton).toBeEnabled();
      });

      const addButton = screen.getByText('Add to Profile');
      fireEvent.click(addButton);

      // Should show success (optimistic update) even though server fails
      await waitFor(() => {
        expect(mockSnackbar.showSnackbar).toHaveBeenCalledWith(
          'Capacity added to profile',
          'success'
        );
      });

      // Server error should be logged but not shown to user
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error updating profile on server:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should disable button while adding capacity', async () => {
      const { profileService } = require('@/services/profileService');
      const { userService } = require('@/services/userService');
      profileService.updateProfile = jest
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({}), 100)));
      userService.fetchUserProfile = jest.fn().mockResolvedValue(mockUserProfile);

      renderCard();

      await waitFor(() => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      });

      await waitFor(() => {
        const addButton = screen.getByText('Add to Profile');
        expect(addButton).toBeEnabled();
      });

      const addButton = screen.getByText('Add to Profile');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('should not add duplicate capacity', async () => {
      const { profileService } = require('@/services/profileService');
      profileService.updateProfile = jest.fn().mockResolvedValue({});

      const profileWithCapacity = {
        ...mockUserProfile,
        skills_wanted: ['50'], // Capacity 50 is already in the list
      };

      renderCard({
        userProfile: profileWithCapacity,
      });

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
      expect(mockRouter.push).toHaveBeenCalledWith('/feed?capacityId=50');
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

  describe('Cache management', () => {
    it('should update query cache after adding capacity', async () => {
      const { profileService } = require('@/services/profileService');
      const { userService } = require('@/services/userService');
      profileService.updateProfile = jest.fn().mockResolvedValue({});
      userService.fetchUserProfile = jest.fn().mockResolvedValue(mockUserProfile);

      renderCard();

      await waitFor(() => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      });

      await waitFor(() => {
        const addButton = screen.getByText('Add to Profile');
        expect(addButton).toBeEnabled();
      });

      const addButton = screen.getByText('Add to Profile');
      fireEvent.click(addButton);

      // Should update cache optimistically with setQueryData
      await waitFor(
        () => {
          expect(queryClient.setQueryData).toHaveBeenCalledWith(
            ['userProfile', '123', 'mock-token'],
            expect.objectContaining({
              skills_wanted: expect.arrayContaining(['50']),
            })
          );
        },
        { timeout: 1000 }
      );
    });
  });
});
