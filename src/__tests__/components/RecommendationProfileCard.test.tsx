import React from 'react';
import RecommendationProfileCard from '@/app/(auth)/home/components/RecommendationProfileCard';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useAvatars } from '@/hooks/useAvatars';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileRecommendation, OrganizationRecommendation } from '@/types/recommendation';
import {
  renderWithProviders,
  setupCommonMocks,
  cleanupMocks,
  createMockSnackbar,
  createMockSavedItems,
  createMockAvatars,
  createMockRouter,
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
jest.mock('@/hooks/useAvatars');
jest.mock('@/hooks/useSavedItems');
jest.mock('@/app/providers/SnackbarProvider');
jest.mock('next/navigation');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Test data factory functions
const createMockProfileRecommendation = (overrides = {}): ProfileRecommendation => ({
  id: 1,
  username: 'testuser',
  display_name: 'Test User',
  profile_image: 'https://example.com/avatar.jpg',
  ...overrides,
});

const createMockOrganizationRecommendation = (overrides = {}): OrganizationRecommendation => ({
  id: 2,
  acronym: 'WMFR',
  display_name: 'Wikimedia France',
  profile_image: 'https://example.com/org-logo.jpg',
  ...overrides,
});

describe('RecommendationProfileCard', () => {
  const mockSnackbar = createMockSnackbar();
  const mockSavedItems = createMockSavedItems();
  const mockAvatars = createMockAvatars();
  const mockRouter = createMockRouter();

  beforeEach(() => {
    const { useRouter } = require('next/navigation');
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    setupCommonMocks(useSession as jest.Mock, useTheme as jest.Mock, useApp as jest.Mock);
    (useAvatars as jest.Mock).mockReturnValue(mockAvatars);
    (useSavedItems as jest.Mock).mockReturnValue(mockSavedItems);
    (useSnackbar as jest.Mock).mockReturnValue(mockSnackbar);
  });

  afterEach(cleanupMocks);

  const renderCard = (props = {}) => {
    const defaultProps = {
      recommendation: createMockProfileRecommendation(),
      ...props,
    };

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const QueryWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return renderWithProviders(<RecommendationProfileCard {...defaultProps} />, [
      QueryWrapper,
      ThemeProvider,
      AppProvider,
    ]);
  };

  describe('Rendering', () => {
    it('should render profile recommendation card correctly', () => {
      renderCard();

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('View Profile')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should render organization recommendation card correctly', () => {
      renderCard({
        recommendation: createMockOrganizationRecommendation(),
      });

      expect(screen.getByText('Wikimedia France')).toBeInTheDocument();
      expect(screen.getByText('View Profile')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should render with hint message when provided', () => {
      renderCard({
        hintMessage: 'Recommended for you',
      });

      expect(screen.getByText('Recommended for you')).toBeInTheDocument();
    });

    it('should render profile image with correct alt text', () => {
      renderCard();

      const image = screen.getByAltText(/Profile picture - Test User/i);
      expect(image).toBeInTheDocument();
    });

    it('should render organization logo with correct alt text', () => {
      renderCard({
        recommendation: createMockOrganizationRecommendation(),
      });

      const image = screen.getByAltText(/Organization logo - Wikimedia France/i);
      expect(image).toBeInTheDocument();
    });

    it('should render in dark mode correctly', () => {
      (useTheme as jest.Mock).mockReturnValue({
        darkMode: true,
      });

      const { container } = renderCard();

      const card = container.querySelector('.bg-gray-800');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Save functionality', () => {
    it('should save profile when Save button is clicked', async () => {
      mockSavedItems.createSavedItem.mockResolvedValue(true);

      renderCard();

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSavedItems.createSavedItem).toHaveBeenCalledWith('user', 1, 'sharer');
      });

      await waitFor(() => {
        expect(mockSnackbar.showSnackbar).toHaveBeenCalledWith(
          'Profile saved successfully',
          'success'
        );
      });
    });

    it('should save organization when Save button is clicked', async () => {
      mockSavedItems.createSavedItem.mockResolvedValue(true);

      renderCard({
        recommendation: createMockOrganizationRecommendation(),
      });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSavedItems.createSavedItem).toHaveBeenCalledWith('org', 2, 'sharer');
      });
    });

    it('should unsave profile when Save button is clicked on saved profile', async () => {
      const savedItem = { id: 999, entity_id: 1, entity: 'user' };

      (useSavedItems as jest.Mock).mockReturnValue({
        savedItems: [savedItem],
        createSavedItem: mockSavedItems.createSavedItem,
        deleteSavedItem: mockSavedItems.deleteSavedItem,
      });

      mockSavedItems.deleteSavedItem.mockResolvedValue(true);

      renderCard();

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSavedItems.deleteSavedItem).toHaveBeenCalledWith(999);
      });

      await waitFor(() => {
        expect(mockSnackbar.showSnackbar).toHaveBeenCalledWith(
          'Profile removed from saved',
          'success'
        );
      });
    });

    it('should show error message when save fails', async () => {
      mockSavedItems.createSavedItem.mockResolvedValue(false);

      renderCard();

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSnackbar.showSnackbar).toHaveBeenCalledWith('Error saving profile', 'error');
      });
    });

    it('should use learner capacity type when capacityType is wanted', async () => {
      mockSavedItems.createSavedItem.mockResolvedValue(true);

      renderCard({
        capacityType: 'wanted',
      });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSavedItems.createSavedItem).toHaveBeenCalledWith('user', 1, 'learner');
      });
    });

    it('should disable save button while saving', async () => {
      mockSavedItems.createSavedItem.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 100))
      );

      renderCard();

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      // Button should be disabled during save
      expect(saveButton.closest('button')).toHaveClass('opacity-50');
    });
  });

  describe('Navigation', () => {
    it('should navigate to profile page when View Profile is clicked for user', () => {
      renderCard();

      const viewButton = screen.getByText('View Profile');
      fireEvent.click(viewButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/profile/testuser');
    });

    it('should navigate to organization page when View Profile is clicked for organization', () => {
      renderCard({
        recommendation: createMockOrganizationRecommendation(),
      });

      const viewButton = screen.getByText('View Profile');
      fireEvent.click(viewButton);

      expect(viewButton).toBeInTheDocument();
    });
  });

  describe('Display states', () => {
    it('should show filled bookmark icon when profile is saved', () => {
      (useSavedItems as jest.Mock).mockReturnValue({
        savedItems: [{ id: 999, entity_id: 1, entity: 'user' }],
        createSavedItem: mockSavedItems.createSavedItem,
        deleteSavedItem: mockSavedItems.deleteSavedItem,
      });

      renderCard();

      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeInTheDocument();

      // Verify the button has the saved styling
      const buttonElement = saveButton.closest('button');
      expect(buttonElement).toHaveClass('bg-[#053749]');
    });

    it('should show username as fallback when display_name is not provided', () => {
      renderCard({
        recommendation: createMockProfileRecommendation({
          display_name: '',
          username: 'fallback_user',
        }),
      });

      expect(screen.getByText('fallback_user')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels on images', () => {
      renderCard();

      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should render hint icon with aria-hidden', () => {
      renderCard({
        hintMessage: 'Test hint',
      });

      expect(screen.getByText('Test hint')).toBeInTheDocument();
    });
  });
});
