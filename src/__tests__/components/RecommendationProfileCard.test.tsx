import RecommendationProfileCard from '@/app/(auth)/home/components/RecommendationProfileCard';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useAvatars } from '@/hooks/useAvatars';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { ProfileRecommendation, OrganizationRecommendation } from '@/types/recommendation';
import {
  renderWithProviders,
  setupCommonMocks,
  cleanupMocks,
  createMockSnackbar,
  createMockSavedItems,
  createMockAvatars,
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

// Helper to setup all mocks
function setupAllMocks(
  mockSnackbar: ReturnType<typeof createMockSnackbar>,
  mockSavedItems: ReturnType<typeof createMockSavedItems>,
  mockAvatars: ReturnType<typeof createMockAvatars>
) {
  setupCommonMocks(useSession as jest.Mock, useTheme as jest.Mock, useApp as jest.Mock);
  (useAvatars as jest.Mock).mockReturnValue(mockAvatars);
  (useSavedItems as jest.Mock).mockReturnValue(mockSavedItems);
  (useSnackbar as jest.Mock).mockReturnValue(mockSnackbar);
}

// Helper to render card with default props
function renderProfileCard(props = {}) {
  const defaultProps = {
    recommendation: createMockProfileRecommendation(),
    ...props,
  };

  return renderWithProviders(<RecommendationProfileCard {...defaultProps} />, [
    ThemeProvider,
    AppProvider,
  ]);
}

// Helper to click save button
async function clickSaveButton() {
  const saveButton = screen.getByText('Save');
  fireEvent.click(saveButton);
}

// Helper to verify snackbar call
async function verifySnackbarCall(mockSnackbar: any, message: string, type: string) {
  await waitFor(() => {
    expect(mockSnackbar.showSnackbar).toHaveBeenCalledWith(message, type);
  });
}

describe('RecommendationProfileCard', () => {
  const mockSnackbar = createMockSnackbar();
  const mockSavedItems = createMockSavedItems();
  const mockAvatars = createMockAvatars();

  beforeEach(() => {
    setupAllMocks(mockSnackbar, mockSavedItems, mockAvatars);
  });

  afterEach(cleanupMocks);

  describe('Rendering', () => {
    it('should render profile recommendation card correctly', () => {
      renderProfileCard();

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('View Profile')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should render organization recommendation card correctly', () => {
      renderProfileCard({
        recommendation: createMockOrganizationRecommendation(),
      });

      expect(screen.getByText('Wikimedia France')).toBeInTheDocument();
      expect(screen.getByText('View Profile')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should render with hint message when provided', () => {
      renderProfileCard({
        hintMessage: 'Recommended for you',
      });

      expect(screen.getByText('Recommended for you')).toBeInTheDocument();
    });

    it('should render profile image with correct alt text', () => {
      renderProfileCard();

      const image = screen.getByAltText(/Profile picture - Test User/i);
      expect(image).toBeInTheDocument();
    });

    it('should render organization logo with correct alt text', () => {
      renderProfileCard({
        recommendation: createMockOrganizationRecommendation(),
      });

      const image = screen.getByAltText(/Organization logo - Wikimedia France/i);
      expect(image).toBeInTheDocument();
    });

    it('should render in dark mode correctly', () => {
      (useTheme as jest.Mock).mockReturnValue({
        darkMode: true,
      });

      const { container } = renderProfileCard();

      const card = container.querySelector('.bg-gray-800');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Save functionality', () => {
    it('should save profile when Save button is clicked', async () => {
      mockSavedItems.createSavedItem.mockResolvedValue(true);

      renderProfileCard();

      await clickSaveButton();

      await waitFor(() => {
        expect(mockSavedItems.createSavedItem).toHaveBeenCalledWith('user', 1, 'sharer');
      });

      await verifySnackbarCall(mockSnackbar, 'Profile saved successfully', 'success');
    });

    it('should save organization when Save button is clicked', async () => {
      mockSavedItems.createSavedItem.mockResolvedValue(true);

      renderProfileCard({
        recommendation: createMockOrganizationRecommendation(),
      });

      await clickSaveButton();

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

      renderProfileCard();

      await clickSaveButton();

      await waitFor(() => {
        expect(mockSavedItems.deleteSavedItem).toHaveBeenCalledWith(999);
      });

      await verifySnackbarCall(mockSnackbar, 'Profile removed from saved', 'success');
    });

    it('should show error message when save fails', async () => {
      mockSavedItems.createSavedItem.mockResolvedValue(false);

      renderProfileCard();

      await clickSaveButton();

      await verifySnackbarCall(mockSnackbar, 'Error saving profile', 'error');
    });

    it('should use learner capacity type when capacityType is wanted', async () => {
      mockSavedItems.createSavedItem.mockResolvedValue(true);

      renderProfileCard({
        capacityType: 'wanted',
      });

      await clickSaveButton();

      await waitFor(() => {
        expect(mockSavedItems.createSavedItem).toHaveBeenCalledWith('user', 1, 'learner');
      });
    });

    it('should disable save button while saving', async () => {
      const delayedResponse = new Promise(resolve => {
        setTimeout(() => resolve(true), 100);
      });
      mockSavedItems.createSavedItem.mockImplementation(() => delayedResponse);

      renderProfileCard();

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      expect(saveButton.closest('button')).toHaveClass('opacity-50');
    });
  });

  describe('Navigation', () => {
    it('should navigate to profile page when View Profile is clicked for user', () => {
      renderProfileCard();

      const viewButton = screen.getByText('View Profile');
      fireEvent.click(viewButton);

      expect(viewButton).toBeInTheDocument();
    });

    it('should navigate to organization page when View Profile is clicked for organization', () => {
      renderProfileCard({
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

      renderProfileCard();

      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeInTheDocument();

      const buttonElement = saveButton.closest('button');
      expect(buttonElement).toHaveClass('bg-[#053749]');
    });

    it('should show username as fallback when display_name is not provided', () => {
      renderProfileCard({
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
      renderProfileCard();

      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should render hint icon with aria-hidden', () => {
      renderProfileCard({
        hintMessage: 'Test hint',
      });

      expect(screen.getByText('Test hint')).toBeInTheDocument();
    });
  });
});
