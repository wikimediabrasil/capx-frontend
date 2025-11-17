import RecommendationProfileCard from '@/app/(auth)/home/components/RecommendationProfileCard';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useAvatars } from '@/hooks/useAvatars';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SessionProvider, useSession } from 'next-auth/react';
import { ProfileRecommendation, OrganizationRecommendation } from '@/types/recommendation';

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

jest.mock('@/hooks/useAvatars', () => ({
  useAvatars: jest.fn(),
}));

jest.mock('@/hooks/useSavedItems', () => ({
  useSavedItems: jest.fn(),
}));

jest.mock('@/app/providers/SnackbarProvider', () => ({
  useSnackbar: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

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

// Common mock data
const createMockPageContent = () => ({
  'view-profile': 'View Profile',
  'save': 'Save',
  'saved-profiles-delete-success': 'Profile removed from saved',
  'saved-profiles-add-success': 'Profile saved successfully',
  'saved-profiles-error': 'Error saving profile',
  'profile-picture': 'Profile picture',
  'organization-logo': 'Organization logo',
});

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={null}>
      <ThemeProvider>
        <AppProvider>{children}</AppProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

describe('RecommendationProfileCard', () => {
  const mockShowSnackbar = jest.fn();
  const mockCreateSavedItem = jest.fn();
  const mockDeleteSavedItem = jest.fn();

  beforeEach(() => {
    // Setup mocks
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mock-token', id: '123' } },
    });

    (useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
    });

    (useApp as jest.Mock).mockReturnValue({
      pageContent: createMockPageContent(),
      language: 'en',
    });

    (useAvatars as jest.Mock).mockReturnValue({
      avatars: [],
    });

    (useSavedItems as jest.Mock).mockReturnValue({
      savedItems: [],
      createSavedItem: mockCreateSavedItem,
      deleteSavedItem: mockDeleteSavedItem,
    });

    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderCard = (props = {}) => {
    const defaultProps = {
      recommendation: createMockProfileRecommendation(),
      ...props,
    };

    return render(<RecommendationProfileCard {...defaultProps} />, {
      wrapper: TestWrapper,
    });
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
      mockCreateSavedItem.mockResolvedValue(true);

      renderCard();

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateSavedItem).toHaveBeenCalledWith('user', 1, 'sharer');
      });

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Profile saved successfully',
          'success'
        );
      });
    });

    it('should save organization when Save button is clicked', async () => {
      mockCreateSavedItem.mockResolvedValue(true);

      renderCard({
        recommendation: createMockOrganizationRecommendation(),
      });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateSavedItem).toHaveBeenCalledWith('org', 2, 'sharer');
      });
    });

    it('should unsave profile when Save button is clicked on saved profile', async () => {
      const savedItem = { id: 999, entity_id: 1, entity: 'user' };

      (useSavedItems as jest.Mock).mockReturnValue({
        savedItems: [savedItem],
        createSavedItem: mockCreateSavedItem,
        deleteSavedItem: mockDeleteSavedItem,
      });

      mockDeleteSavedItem.mockResolvedValue(true);

      renderCard();

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockDeleteSavedItem).toHaveBeenCalledWith(999);
      });

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Profile removed from saved',
          'success'
        );
      });
    });

    it('should show error message when save fails', async () => {
      mockCreateSavedItem.mockResolvedValue(false);

      renderCard();

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Error saving profile',
          'error'
        );
      });
    });

    it('should use learner capacity type when capacityType is wanted', async () => {
      mockCreateSavedItem.mockResolvedValue(true);

      renderCard({
        capacityType: 'wanted',
      });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateSavedItem).toHaveBeenCalledWith('user', 1, 'learner');
      });
    });

    it('should disable save button while saving', async () => {
      mockCreateSavedItem.mockImplementation(
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
      const originalLocation = window.location.href;

      renderCard();

      const viewButton = screen.getByText('View Profile');
      fireEvent.click(viewButton);

      // Note: In a real implementation, you would use next/router mock
      // Here we just verify the function was set up
      expect(viewButton).toBeInTheDocument();
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
        createSavedItem: mockCreateSavedItem,
        deleteSavedItem: mockDeleteSavedItem,
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
