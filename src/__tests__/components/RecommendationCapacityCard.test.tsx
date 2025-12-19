import RecommendationCapacityCard from '@/app/(auth)/home/components/RecommendationCapacityCard';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { CapacityCacheProvider, useCapacityCache } from '@/contexts/CapacityCacheContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { CapacityRecommendation } from '@/types/recommendation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import React from 'react';
import {
  cleanupMocks,
  createMockCapacityCache,
  createMockQueryClient,
  createMockRouter,
  createMockSnackbar,
  renderWithProviders,
  setupCommonMocks,
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
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));
jest.mock('@/services/profileService', () => ({
  profileService: {
    updateProfile: jest.fn(),
  },
}));
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

const createMockUserProfile = () => ({
  id: 123,
  username: 'testuser',
  skills_wanted: [],
  language: ['en'],
});

// Helper to setup all mocks
function setupAllMocks(
  mockSnackbar: ReturnType<typeof createMockSnackbar>,
  mockRouter: ReturnType<typeof createMockRouter>,
  mockQueryClient: ReturnType<typeof createMockQueryClient>,
  mockUserProfile: ReturnType<typeof createMockUserProfile>
) {
  const { useRouter } = require('next/navigation');
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  setupCommonMocks(useSession as jest.Mock, useTheme as jest.Mock, useApp as jest.Mock);
  (useCapacityCache as jest.Mock).mockReturnValue(createMockCapacityCache());
  (useSnackbar as jest.Mock).mockReturnValue(mockSnackbar);
  (useQuery as jest.Mock).mockReturnValue({
    data: mockUserProfile,
    isLoading: false,
  });

  // Setup queryClient.getQueryData to return user profile
  mockQueryClient.getQueryData.mockImplementation((queryKey: any) => {
    if (Array.isArray(queryKey) && queryKey[0] === 'userProfile') {
      return mockUserProfile;
    }
    return undefined;
  });

  (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
}

// Helper to render card with default props
function renderCapacityCard(props = {}) {
  const defaultProps = {
    recommendation: createMockCapacityRecommendation(),
    ...props,
  };

  return renderWithProviders(<RecommendationCapacityCard {...defaultProps} />, [
    ThemeProvider,
    AppProvider,
    CapacityCacheProvider,
  ]);
}

// Helper to wait for card to be loaded
async function waitForCardLoaded() {
  await waitFor(() => {
    const headings = screen.queryAllByText('Learning');
    expect(headings.length).toBeGreaterThan(0);
  });
}

// Helper to click add to profile button
async function clickAddToProfileButton() {
  await waitFor(() => {
    expect(screen.getByText('Add to Profile')).toBeInTheDocument();
  });

  const addButton = screen.getByText('Add to Profile');
  fireEvent.click(addButton);
}

describe('RecommendationCapacityCard', () => {
  const mockSnackbar = createMockSnackbar();
  const mockRouter = createMockRouter();
  const mockQueryClient = createMockQueryClient();
  const mockUserProfile = createMockUserProfile();

  // Create stable mock function that persists across ALL renders and tests
  const mockPreloadCapacities = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    setupAllMocks(mockSnackbar, mockRouter, mockQueryClient, mockUserProfile);
  });

  afterEach(cleanupMocks);

  describe('Rendering', () => {
    it('should render capacity recommendation card correctly', async () => {
      renderCapacityCard();

      await waitForCardLoaded();

      expect(screen.getByText('Learning capability')).toBeInTheDocument();
      expect(screen.getByText('Add to Profile')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();

      // Verify preloadCapacities was called
      expect(mockPreloadCapacities).toHaveBeenCalled();
    });

    it('should render with hint message when provided', async () => {
      renderCapacityCard({
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

      const { container } = renderCapacityCard();

      await waitFor(() => {
        const card = container.querySelector('.bg-gray-800');
        expect(card).toBeInTheDocument();
      });
    });

    it('should eventually show content after loading', async () => {
      renderCapacityCard();

      await waitFor(() => {
        expect(screen.getByText('Add to Profile')).toBeInTheDocument();
      });
    });
  });

  describe('Add to Profile functionality', () => {
    it('should add capacity to profile when Add to Profile button is clicked', async () => {
      const { profileService } = require('@/services/profileService');
      profileService.updateProfile = jest.fn().mockResolvedValue({});

      renderCapacityCard();

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

      renderCapacityCard();

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

      renderCapacityCard();

      await clickAddToProfileButton();

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
      const delayedResponse = new Promise(resolve => {
        setTimeout(() => resolve({}), 100);
      });
      profileService.updateProfile.mockImplementation(() => delayedResponse);

      renderCapacityCard();

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

      renderCapacityCard();

      await waitFor(() => {
        expect(screen.getByText('✓ Added')).toBeInTheDocument();
      });

      expect(profileService.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('View functionality', () => {
    it('should redirect to feed page with capacity filter when View button is clicked', async () => {
      renderCapacityCard();

      await clickAddToProfileButton();

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/feed?capacityId=50');
    });
  });

  describe('Capacity data', () => {
    it('should use recommendation name if provided', async () => {
      renderCapacityCard({
        recommendation: createMockCapacityRecommendation({
          name: 'Custom Capacity Name',
        }),
      });

      await waitFor(() => {
        expect(screen.getByText('Custom Capacity Name')).toBeInTheDocument();
      });
    });

    it('should use cached name if recommendation name is empty', async () => {
      renderCapacityCard({
        recommendation: createMockCapacityRecommendation({
          name: '',
        }),
      });

      await waitFor(() => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      });
    });

    it('should use recommendation description if provided', async () => {
      renderCapacityCard({
        recommendation: createMockCapacityRecommendation({
          description: 'Custom description',
        }),
      });

      await waitFor(() => {
        expect(screen.getByText('Custom description')).toBeInTheDocument();
      });
    });

    it('should use cached description if recommendation description is empty', async () => {
      renderCapacityCard({
        recommendation: createMockCapacityRecommendation({
          description: '',
        }),
      });

      await waitFor(() => {
        expect(screen.getByText('Learning capability')).toBeInTheDocument();
      });
    });

    it('should display capacity icon with correct styling', async () => {
      renderCapacityCard();

      await waitFor(() => {
        const icon = screen.getByAltText('Capacity icon');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels and semantic HTML', async () => {
      renderCapacityCard();

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /Learning/i });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should render hint icon with aria-hidden', async () => {
      renderCapacityCard({
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

      renderCapacityCard();

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
          expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
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
