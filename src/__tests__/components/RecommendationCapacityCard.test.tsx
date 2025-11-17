import RecommendationCapacityCard from '@/app/(auth)/home/components/RecommendationCapacityCard';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { CapacityCacheProvider, useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
jest.mock('@tanstack/react-query');
jest.mock('@/services/profileService');
jest.mock('@/services/userService');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
jest.mock('next/navigation');

// Test data factory
const createMockCapacityRecommendation = (overrides = {}): CapacityRecommendation => ({
  id: 50,
  name: 'Learning',
  description: 'Learning capability',
  color: 'learning',
  ...overrides,
});

describe('RecommendationCapacityCard', () => {
  const mockSnackbar = createMockSnackbar();
  const mockRouter = createMockRouter();
  const mockQueryClient = createMockQueryClient();

  const mockUserProfile = {
    id: 123,
    username: 'testuser',
    skills_wanted: [],
    language: ['en'],
  };

  beforeEach(() => {
    const { useRouter } = require('next/navigation');
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    setupCommonMocks(useSession as jest.Mock, useTheme as jest.Mock, useApp as jest.Mock);
    (useCapacityCache as jest.Mock).mockReturnValue(createMockCapacityCache());
    (useSnackbar as jest.Mock).mockReturnValue(mockSnackbar);
    (useQuery as jest.Mock).mockReturnValue({
      data: mockUserProfile,
      isLoading: false,
    });
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
  });

  afterEach(cleanupMocks);

  const renderCard = (props = {}) => {
    const defaultProps = {
      recommendation: createMockCapacityRecommendation(),
      ...props,
    };

    return renderWithProviders(
      <RecommendationCapacityCard {...defaultProps} />,
      [ThemeProvider, AppProvider, CapacityCacheProvider]
    );
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
        expect(mockSnackbar.showSnackbar).toHaveBeenCalledWith(
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
        expect(mockSnackbar.showSnackbar).toHaveBeenCalledWith(
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
