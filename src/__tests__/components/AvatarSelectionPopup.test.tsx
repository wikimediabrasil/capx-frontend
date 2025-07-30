import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AvatarSelectionPopup from '../../app/(auth)/profile/components/AvatarSelectionPopup';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';

// Next.js Image mock
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// useAvatars mock
const mockAvatars = [
  { id: 2, avatar_url: 'https://example.com/avatar2.svg' },
  { id: 3, avatar_url: 'https://example.com/avatar3.svg' },
  { id: 4, avatar_url: 'https://example.com/avatar4.svg' },
];

const mockUseAvatars = jest.fn(() => ({
  avatars: mockAvatars,
  isLoading: false,
}));

jest.mock('@/hooks/useAvatars', () => ({
  useAvatars: () => mockUseAvatars(),
}));

// useTheme mock
jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

// useApp mock
const mockPageContent = {
  'edit-profile-choose-an-option': 'Choose an option',
  'auth-dialog-button-close': 'Close',
  'edit-profile-update': 'Update',
};

const mockUseApp = jest.fn(() => ({
  pageContent: mockPageContent,
  isMobile: false,
}));

jest.mock('@/contexts/AppContext', () => ({
  useApp: () => mockUseApp(),
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('AvatarSelectionPopup', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onSelect: jest.fn(),
    selectedAvatarId: 2,
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });
    mockUseAvatars.mockReturnValue({
      avatars: mockAvatars,
      isLoading: false,
    });
    mockUseApp.mockReturnValue({
      pageContent: mockPageContent,
      isMobile: false,
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  describe('Desktop View', () => {
    it('renders the popup with title', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('displays the "No Avatar" option as first choice', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const noAvatarImage = screen.getByAltText('Avatar no-avatar');
      expect(noAvatarImage).toBeInTheDocument();
      expect(noAvatarImage).toHaveAttribute(
        'src',
        'https://upload.wikimedia.org/wikipedia/commons/6/60/CapX_-_No_avatar.svg'
      );
    });

    it('displays the white "No Avatar" option when in dark mode', () => {
      (ThemeContext.useTheme as jest.Mock).mockReturnValue({
        darkMode: true,
        setDarkMode: jest.fn(),
      });

      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const noAvatarImage = screen.getByAltText('Avatar no-avatar');
      expect(noAvatarImage).toBeInTheDocument();
      expect(noAvatarImage).toHaveAttribute(
        'src',
        'https://upload.wikimedia.org/wikipedia/commons/7/7a/CapX_-_No_avatar_white.svg'
      );
    });

    it('displays all avatars from the API', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      expect(screen.getByAltText('Avatar 2')).toBeInTheDocument();
      expect(screen.getByAltText('Avatar 3')).toBeInTheDocument();
      expect(screen.getByAltText('Avatar 4')).toBeInTheDocument();
    });

    it('highlights the currently selected avatar', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const selectedAvatar = screen.getByAltText('Avatar 2').closest('div')?.parentElement;
      expect(selectedAvatar).toHaveClass('border-2', 'border-[#851970]');
    });

    it('allows selecting a different avatar', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const avatar3 = screen.getByAltText('Avatar 3').closest('button');
      fireEvent.click(avatar3!);

      const selectedAvatar = screen.getByAltText('Avatar 3').closest('div')?.parentElement;
      expect(selectedAvatar).toHaveClass('border-2', 'border-[#851970]');
    });

    it('allows selecting "No Avatar" option', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const noAvatarButton = screen.getByAltText('Avatar no-avatar').closest('button');
      fireEvent.click(noAvatarButton!);

      const selectedNoAvatar = screen.getByAltText('Avatar no-avatar').closest('div')?.parentElement;
      expect(selectedNoAvatar).toHaveClass('border-2', 'border-[#851970]');
    });

    it('calls onSelect with null when "No Avatar" is selected and update is clicked', async () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const noAvatarButton = screen.getByAltText('Avatar no-avatar').closest('button');
      fireEvent.click(noAvatarButton!);

      const updateButton = screen.getByText('Update');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(defaultProps.onSelect).toHaveBeenCalledWith(null);
      });
    });

    it('calls onSelect with avatar ID when an avatar is selected and update is clicked', async () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const avatar3Button = screen.getByAltText('Avatar 3').closest('button');
      fireEvent.click(avatar3Button!);

      const updateButton = screen.getByText('Update');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(defaultProps.onSelect).toHaveBeenCalledWith(3);
      });
    });

    it('calls onClose when close button is clicked', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const backdrop = screen.getByTestId('backdrop');
      fireEvent.click(backdrop);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onUpdate when update is clicked and onUpdate is provided', async () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const updateButton = screen.getByText('Update');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(defaultProps.onUpdate).toHaveBeenCalled();
      });
    });

    it('prevents body scroll when popup is open', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when popup is unmounted', () => {
      const { unmount } = renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      unmount();

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      mockUseApp.mockReturnValue({
        pageContent: mockPageContent,
        isMobile: true,
      });
    });

    it('renders mobile layout when isMobile is true', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      // Mobile layout has different dimensions and structure
      const popup = screen.getByTestId('mobile-popup');
      expect(popup).toHaveClass('h-[477px]', 'w-[273px]');
    });

    it('displays avatars in 2-column grid on mobile', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const grid = screen.getByTestId('mobile-popup').querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2');
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockUseAvatars.mockReturnValue({
        avatars: [],
        isLoading: true,
      });
    });

    it('shows loading state when avatars are loading', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      expect(screen.getByText('Loading avatars...')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    beforeEach(() => {
      (ThemeContext.useTheme as jest.Mock).mockReturnValue({
        darkMode: true,
        setDarkMode: jest.fn(),
      });
    });

    it('applies dark mode styles', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const popup = screen.getByTestId('desktop-popup');
      expect(popup).toHaveClass('bg-[#005B3F]', 'text-white');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty avatars array', () => {
      mockUseAvatars.mockReturnValue({
        avatars: [],
        isLoading: false,
      });

      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      // Should still show the "No Avatar" option
      expect(screen.getByAltText('Avatar no-avatar')).toBeInTheDocument();
    });

    it('handles selectedAvatarId as null', () => {
      renderWithProviders(
        <AvatarSelectionPopup {...defaultProps} selectedAvatarId={null} />
      );

      // The "No Avatar" option should be selected
      const noAvatar = screen.getByAltText('Avatar no-avatar').closest('div')?.parentElement;
      expect(noAvatar).toHaveClass('border-2', 'border-[#851970]');
    });

    it('calls onClose and onSelect when update is clicked without onUpdate', async () => {
      const propsWithoutUpdate = {
        onClose: jest.fn(),
        onSelect: jest.fn(),
        selectedAvatarId: 2,
      };

      renderWithProviders(<AvatarSelectionPopup {...propsWithoutUpdate} />);

      const updateButton = screen.getByText('Update');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(propsWithoutUpdate.onSelect).toHaveBeenCalledWith(2);
        expect(propsWithoutUpdate.onClose).toHaveBeenCalled();
      });
    });

    it('maintains selection state when clicking on already selected avatar', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      const avatar2Button = screen.getByAltText('Avatar 2').closest('button');
      fireEvent.click(avatar2Button!);

      // Should still be selected
      const selectedAvatar = screen.getByAltText('Avatar 2').closest('div')?.parentElement;
      expect(selectedAvatar).toHaveClass('border-2', 'border-[#851970]');
    });

    it('updates selection when clicking on different avatar', () => {
      renderWithProviders(<AvatarSelectionPopup {...defaultProps} />);

      // Initially avatar 2 should be selected
      let selectedAvatar = screen.getByAltText('Avatar 2').closest('div')?.parentElement;
      expect(selectedAvatar).toHaveClass('border-2', 'border-[#851970]');

      // Click on avatar 3
      const avatar3Button = screen.getByAltText('Avatar 3').closest('button');
      fireEvent.click(avatar3Button!);

      // Avatar 2 should no longer be selected
      selectedAvatar = screen.getByAltText('Avatar 2').closest('div')?.parentElement;
      expect(selectedAvatar).not.toHaveClass('border-2', 'border-[#851970]');

      // Avatar 3 should now be selected
      const newSelectedAvatar = screen.getByAltText('Avatar 3').closest('div')?.parentElement;
      expect(newSelectedAvatar).toHaveClass('border-2', 'border-[#851970]');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = 'unset';
  });
}); 