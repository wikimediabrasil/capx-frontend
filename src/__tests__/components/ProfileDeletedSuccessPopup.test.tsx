import { render, screen, waitFor } from '@testing-library/react';
import ProfileDeletedSuccessPopup from '@/components/ProfileDeletedSuccessPopup';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';

// Mock AppContext
jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: () => ({
    pageContent: {
      'profile-deleted-title': 'Profile successfully deleted',
      'profile-deleted-message': 'Your profile has been permanently deleted from CapX.',
      'profile-deleted-submessage':
        'Thank you for being part of our community. You can create a new account at any time.',
      'profile-deleted-ok-button': 'OK',
      'alt-illustration': 'Success illustration',
    },
    isMobile: false,
  }),
}));

// Mock Next.js Router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock useTheme
jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

describe('ProfileDeletedSuccessPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
      theme: {
        fontSize: {
          mobile: { base: '14px' },
          desktop: { base: '24px' },
        },
      },
      getFontSize: () => ({ mobile: '14px', desktop: '24px' }),
      getBackgroundColor: () => '#FFFFFF',
      getTextColor: () => '#000000',
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  it('should render popup when isOpen is true', () => {
    const onClose = jest.fn();

    renderWithProviders(<ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Profile successfully deleted')).toBeInTheDocument();
    expect(
      screen.getByText('Your profile has been permanently deleted from CapX.')
    ).toBeInTheDocument();
  });

  it('should not render popup when isOpen is false', () => {
    const onClose = jest.fn();

    renderWithProviders(<ProfileDeletedSuccessPopup isOpen={false} onClose={onClose} />);

    expect(screen.queryByText('Profile successfully deleted')).not.toBeInTheDocument();
  });

  it('should display all required text content', () => {
    const onClose = jest.fn();

    renderWithProviders(<ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Profile successfully deleted')).toBeInTheDocument();
    expect(
      screen.getByText('Your profile has been permanently deleted from CapX.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Thank you for being part of our community. You can create a new account at any time.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('should auto-close after 3 seconds', async () => {
    const onClose = jest.fn();

    renderWithProviders(<ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();

    // Fast-forward time by 3 seconds
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should not auto-close before 3 seconds', () => {
    const onClose = jest.fn();

    renderWithProviders(<ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />);

    // Fast-forward time by 2.9 seconds (just before 3s)
    jest.advanceTimersByTime(2900);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should clear timeout when component unmounts', () => {
    const onClose = jest.fn();

    const { unmount } = renderWithProviders(
      <ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />
    );

    unmount();

    // Fast-forward time after unmount
    jest.advanceTimersByTime(3000);

    // onClose should not be called because timeout was cleared
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should restart timer if isOpen changes from false to true', async () => {
    const onClose = jest.fn();

    const { rerender } = renderWithProviders(
      <ProfileDeletedSuccessPopup isOpen={false} onClose={onClose} />
    );

    // Open the popup
    rerender(
      <ThemeProvider>
        <AppProvider>
          <ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />
        </AppProvider>
      </ThemeProvider>
    );

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should render image in light mode', () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
      theme: {
        fontSize: {
          mobile: { base: '14px' },
          desktop: { base: '24px' },
        },
      },
      getFontSize: () => ({ mobile: '14px', desktop: '24px' }),
      getBackgroundColor: () => '#FFFFFF',
      getTextColor: () => '#000000',
    });

    const onClose = jest.fn();

    renderWithProviders(<ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', 'Success illustration');
    expect(image).toBeInTheDocument();
  });

  it('should render image in dark mode', () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: true,
      setDarkMode: jest.fn(),
      theme: {
        fontSize: {
          mobile: { base: '14px' },
          desktop: { base: '24px' },
        },
      },
      getFontSize: () => ({ mobile: '14px', desktop: '24px' }),
      getBackgroundColor: () => '#005B3F',
      getTextColor: () => '#FFFFFF',
    });

    const onClose = jest.fn();

    renderWithProviders(<ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />);

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Success illustration');
  });

  it('should switch icon based on theme mode', () => {
    const onClose = jest.fn();

    // Render in light mode first
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
      theme: {
        fontSize: {
          mobile: { base: '14px' },
          desktop: { base: '24px' },
        },
      },
      getFontSize: () => ({ mobile: '14px', desktop: '24px' }),
      getBackgroundColor: () => '#FFFFFF',
      getTextColor: () => '#000000',
    });

    const { rerender } = renderWithProviders(
      <ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />
    );

    let image = screen.getByRole('img');
    expect(image).toBeInTheDocument();

    // Change to dark mode
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: true,
      setDarkMode: jest.fn(),
      theme: {
        fontSize: {
          mobile: { base: '14px' },
          desktop: { base: '24px' },
        },
      },
      getFontSize: () => ({ mobile: '14px', desktop: '24px' }),
      getBackgroundColor: () => '#005B3F',
      getTextColor: () => '#FFFFFF',
    });

    rerender(
      <ThemeProvider>
        <AppProvider>
          <ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />
        </AppProvider>
      </ThemeProvider>
    );

    image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });

  it('should have accessible dialog attributes', () => {
    const onClose = jest.fn();

    renderWithProviders(<ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'popup-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'popup-content');
  });

  it('should call onClose only once even if timer fires multiple times', async () => {
    const onClose = jest.fn();

    renderWithProviders(<ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />);

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    // Try to advance timer again
    jest.advanceTimersByTime(3000);

    // Should still only be called once
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid open/close cycles', async () => {
    const onClose = jest.fn();

    const { rerender } = renderWithProviders(
      <ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />
    );

    jest.advanceTimersByTime(1000);

    // Close
    rerender(
      <ThemeProvider>
        <AppProvider>
          <ProfileDeletedSuccessPopup isOpen={false} onClose={onClose} />
        </AppProvider>
      </ThemeProvider>
    );

    jest.advanceTimersByTime(1000);

    // Re-open
    rerender(
      <ThemeProvider>
        <AppProvider>
          <ProfileDeletedSuccessPopup isOpen={true} onClose={onClose} />
        </AppProvider>
      </ThemeProvider>
    );

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});

// Mock console.error to avoid cluttering test output
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});
