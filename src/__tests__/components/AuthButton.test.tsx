import { render, screen, fireEvent } from '@testing-library/react';
import AuthButton from '@/components/AuthButton';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';
import MoveOutIcon from '@/public/static/images/move_item.svg';

const mockPageContent = {
  'sign-in-button': 'Login',
  'sign-out-button': 'Logout',
};

// Mock AppContext
jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: () => ({
    pageContent: mockPageContent,
    isMobile: false,
  }),
}));

// Mock do Next.js Router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: () => jest.fn(),
      replace: () => jest.fn(),
      prefetch: () => jest.fn(),
      back: () => jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock do useTheme
jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

describe('AuthButton', () => {
  beforeEach(() => {
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

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  it('renders login button correctly', () => {
    renderWithProviders(
      <AuthButton message={mockPageContent['sign-in-button']} isSignOut={false} />
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders logout button correctly', () => {
    renderWithProviders(
      <AuthButton message={mockPageContent['sign-out-button']} isSignOut={true} />
    );

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('applies correct styles for sign out button', () => {
    const { container } = renderWithProviders(
      <AuthButton
        message={mockPageContent['sign-out-button']}
        isSignOut={true}
        isMobileMenu={true}
        imageUrl={MoveOutIcon}
      />
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('w-full');
  });

  it('applies correct styles for sign in button', () => {
    const { container } = renderWithProviders(
      <AuthButton message={mockPageContent['sign-in-button']} isSignOut={false} />
    );

    const button = container.querySelector('button');
    expect(button).not.toHaveClass('w-full');
  });

  it('includes image when imageUrl is provided', () => {
    renderWithProviders(
      <AuthButton
        message={mockPageContent['sign-out-button']}
        isSignOut={true}
        imageUrl={MoveOutIcon}
      />
    );

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });

  it('applies dark mode styles', () => {
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

    renderWithProviders(
      <AuthButton message="Sign In" isSignOut={false} customClass="bg-capx-dark-primary" />
    );

    const button = screen.getByText('Sign In');
    expect(button.closest('button')).toHaveClass('bg-capx-dark-primary');
  });

  it('applies light mode styles', () => {
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

    renderWithProviders(
      <AuthButton message="Sign In" isSignOut={false} customClass="bg-capx-light-primary" />
    );

    const button = screen.getByText('Sign In');
    expect(button.closest('button')).toHaveClass('bg-capx-light-primary');
  });

  it('handles long text without breaking layout', () => {
    const longMessage =
      'Entrar com sua conta da Wikimedia para acessar todos os recursos disponíveis';

    renderWithProviders(<AuthButton message={longMessage} isSignOut={false} />);

    const button = screen.getByText(longMessage);
    const buttonContainer = button.closest('button');
    expect(buttonContainer).toHaveClass('min-w-[120px]', 'max-w-[200px]');
  });

  it('handles long text in mobile view', () => {
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    const longMessage = 'Entrar com sua conta da Wikimedia';

    renderWithProviders(<AuthButton message={longMessage} isSignOut={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-[14px]');
  });

  it('shows full text in desktop view', () => {
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));

    const longMessage = 'Entrar com sua conta da Wikimedia';

    renderWithProviders(<AuthButton message={longMessage} isSignOut={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('md:text-[24px]');
  });

  it('handles text responsively', () => {
    const longMessage = 'Entrar com sua conta da Wikimedia para acessar todos os recursos';

    renderWithProviders(<AuthButton message={longMessage} isSignOut={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-[14px]', 'md:text-[24px]');
  });

  it('maintains consistent button sizing', () => {
    renderWithProviders(<AuthButton message="Test" isSignOut={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('min-w-[120px]', 'max-w-[200px]');
    expect(button).toHaveClass('md:min-w-[140px]', 'md:max-w-[280px]');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
