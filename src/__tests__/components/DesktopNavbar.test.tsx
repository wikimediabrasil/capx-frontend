import { render, screen, fireEvent } from '@testing-library/react';
import DesktopNavbar from '@/components/DesktopNavbar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';
import { useSession } from 'next-auth/react';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import axios from 'axios';
import { Session } from 'next-auth';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock useOrganization hook
jest.mock('@/hooks/useOrganizationProfile', () => ({
  useOrganization: jest.fn(),
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

// Mock do axios
jest.mock('axios');
(axios.get as jest.Mock).mockImplementation((url: string) => {
  if (url.includes('/languages')) {
    return Promise.resolve({
      data: ['pt-BR', 'en', 'es'],
    });
  }
  return Promise.resolve({
    data: {
      'sign-in-button': 'Entrar',
      'sign-out-button': 'Sair',
    },
  });
});

// Mock do LanguageSelect
jest.mock('../../components/LanguageSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="language-select-mock">Language Select</div>,
}));

const mockPageContent = {
  'sign-in-button': 'Login',
  'sign-out-button': 'Logout',
  'navbar-link-home': 'Home',
  'navbar-link-capacities': 'Capacities',
  'navbar-link-reports': 'Reports',
  'navbar-link-feed': 'Feed',
  'navbar-link-saved': 'Saved',
  'navbar-link-report-bug': 'Report Bug',
};

// Mocking AppContext
jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: () => ({
    pageContent: {
      'sign-in-button': 'Login',
      'sign-out-button': 'Logout',
      'navbar-link-home': 'Home',
      'navbar-link-capacities': 'Capacities',
      'navbar-link-reports': 'Reports',
      'navbar-link-feed': 'Feed',
      'navbar-link-saved': 'Saved',
      'navbar-link-report-bug': 'Report Bug',
    },
    isMobile: true,
    mobileMenuStatus: true,
    setMobileMenuStatus: jest.fn(),
    language: 'en',
    setLanguage: jest.fn(),
    darkMode: false,
    setDarkMode: jest.fn(),
    session: null,
    setSession: jest.fn(),
    setPageContent: jest.fn(),
    isLoading: false,
    setIsLoading: jest.fn(),
    isMenuOpen: false,
    setIsMenuOpen: jest.fn(),
  }),
}));

describe('DesktopNavbar', () => {
  beforeEach(() => {
    // Mock do useSession
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mock-token' } },
      status: 'authenticated',
    });

    // Mock do useOrganization
    (useOrganization as jest.Mock).mockReturnValue({
      organizations: [
        { id: 1, display_name: 'Org 1' },
        { id: 2, display_name: 'Org 2' },
      ],
      isOrgManager: true,
    });

    // Mock do useTheme
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  // Mock sessions
  const nullSession: Session | null = null;
  const validSession: Session = {
    user: {
      id: '123',
      token: 'test-token',
      username: 'test-user',
      first_login: false,
      name: 'Test User',
      email: 'test@example.com',
      image: 'test-image.jpg',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  it('renders logo correctly', () => {
    renderWithProviders(
      <DesktopNavbar session={nullSession} language="en" setLanguage={() => {}} />
    );

    const logo = screen.getByAltText('Capacity Exchange logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links when logged in', () => {
    renderWithProviders(
      <DesktopNavbar session={validSession} language="en" setLanguage={() => {}} />
    );

    // Search for the menu button
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    // Check the links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Capacities')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders sign in button when not logged in', () => {
    renderWithProviders(
      <DesktopNavbar session={nullSession} language="en" setLanguage={() => {}} />
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders sign out button when logged in', () => {
    renderWithProviders(
      <DesktopNavbar session={validSession} language="en" setLanguage={() => {}} />
    );

    // Search for the menu button
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    // Check if the logout button is present
    const logoutButton = screen.getByText(mockPageContent['sign-out-button']);
    expect(logoutButton).toBeInTheDocument();
  });

  it('applies dark mode styles', () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: true,
      setDarkMode: jest.fn(),
    });

    const { container } = renderWithProviders(
      <DesktopNavbar session={nullSession} language="en" setLanguage={() => {}} />
    );

    const navbar = container.firstChild as HTMLElement;
    expect(navbar.className).toContain('bg-capx-dark-box-bg');
    expect(navbar.className).toContain('text-capx-dark-text');
  });

  it('applies light mode styles', () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });

    const { container } = renderWithProviders(
      <DesktopNavbar session={nullSession} language="en" setLanguage={() => {}} />
    );

    const navbar = container.firstChild as HTMLElement;
    expect(navbar.className).toContain('bg-capx-light-bg');
    expect(navbar.className).toContain('text-capx-light-text');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
