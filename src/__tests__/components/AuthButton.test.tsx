import { screen } from '@testing-library/react';
import AuthButton from '@/components/AuthButton';
import * as ThemeContext from '@/contexts/ThemeContext';
import MoveOutIcon from '@/public/static/images/move_item.svg';
import {
  renderWithProviders,
  createMockThemeContext,
  createMockPageContent,
} from '../utils/test-helpers';

const mockPageContent = createMockPageContent();

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
    jest.clearAllMocks();
    (ThemeContext.useTheme as jest.Mock).mockReturnValue(createMockThemeContext(false));
  });

  const renderButton = (props: any) => {
    return renderWithProviders(<AuthButton {...props} />);
  };

  it('renders login button correctly', () => {
    renderButton({ message: mockPageContent['sign-in-button'], isSignOut: false });
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders logout button correctly', () => {
    renderButton({ message: mockPageContent['sign-out-button'], isSignOut: true });
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('applies correct styles for sign out button', () => {
    const { container } = renderButton({
      message: mockPageContent['sign-out-button'],
      isSignOut: true,
      isMobileMenu: true,
      imageUrl: MoveOutIcon,
    });

    expect(container.querySelector('button')).toHaveClass('w-full');
  });

  it('applies correct styles for sign in button', () => {
    const { container } = renderButton({
      message: mockPageContent['sign-in-button'],
      isSignOut: false,
    });

    expect(container.querySelector('button')).not.toHaveClass('w-full');
  });

  it('includes image when imageUrl is provided', () => {
    renderButton({
      message: mockPageContent['sign-out-button'],
      isSignOut: true,
      imageUrl: MoveOutIcon,
    });

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  const testThemeMode = (darkMode: boolean, expectedClass: string) => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue(createMockThemeContext(darkMode));
    renderButton({ message: 'Sign In', isSignOut: false, customClass: expectedClass });
    expect(screen.getByText('Sign In').closest('button')).toHaveClass(expectedClass);
  };

  it('applies dark mode styles', () => {
    testThemeMode(true, 'bg-capx-dark-primary');
  });

  it('applies light mode styles', () => {
    testThemeMode(false, 'bg-capx-light-primary');
  });

  it('handles long text without breaking layout', () => {
    const longMessage = 'Entrar com sua conta da Wikimedia para acessar todos os recursos disponíveis';
    renderButton({ message: longMessage, isSignOut: false });

    const buttonContainer = screen.getByText(longMessage).closest('button');
    expect(buttonContainer).toHaveClass('min-w-[120px]', 'max-w-[200px]');
  });

  const testResponsiveView = (width: number, expectedClass: string) => {
    global.innerWidth = width;
    global.dispatchEvent(new Event('resize'));

    renderButton({ message: 'Entrar com sua conta da Wikimedia', isSignOut: false });
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  };

  it('handles long text in mobile view', () => {
    testResponsiveView(375, 'text-[14px]');
  });

  it('shows full text in desktop view', () => {
    testResponsiveView(1024, 'md:text-[24px]');
  });

  it('handles text responsively', () => {
    renderButton({
      message: 'Entrar com sua conta da Wikimedia para acessar todos os recursos',
      isSignOut: false,
    });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-[14px]', 'md:text-[24px]');
  });

  it('maintains consistent button sizing', () => {
    renderButton({ message: 'Test', isSignOut: false });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('min-w-[120px]', 'max-w-[200px]');
    expect(button).toHaveClass('md:min-w-[140px]', 'md:max-w-[280px]');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
