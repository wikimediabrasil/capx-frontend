import DesktopNavbar from '@/components/DesktopNavbar';
import * as ThemeContext from '@/contexts/ThemeContext';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import { fireEvent, screen } from '@testing-library/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import {
  createMockOrganization,
  createMockPageContent,
  createMockSession,
  nullSession,
  renderWithProviders,
  setupAxiosMock,
} from '../utils/test-helpers';

// Mock next-auth's mock
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// useOrganization hook's mock
jest.mock('@/hooks/useOrganizationProfile', () => ({
  useOrganization: jest.fn(),
}));

// Next.js Router's mock
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

// useTheme's mock
jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

// axios's mock
jest.mock('axios');
setupAxiosMock(axios);

// LanguageSelect's mock
jest.mock('../../components/LanguageSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="language-select-mock">Language Select</div>,
}));

const mockPageContent = createMockPageContent();

//  Mocking AppContext
jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: () => ({
    isMobile: true,
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
    // useSession's mock
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mock-token' } },
      status: 'authenticated',
    });

    // useOrganization's mock
    (useOrganization as jest.Mock).mockReturnValue({
      organizations: [createMockOrganization(1, 'Org 1'), createMockOrganization(2, 'Org 2')],
      isOrgManager: true,
    });

    // useTheme's mock
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });
  });

  const validSession = createMockSession();

  it('renders logo correctly', () => {
    renderWithProviders(
      <DesktopNavbar session={nullSession} language="en" setLanguage={() => {}} />
    );

    // The component uses pageContent['alt-logo-main'] or 'CapX - Capacity Exchange logo, navigate to homepage' as alt text
    const logo = screen.getByAltText('CapX - Capacity Exchange logo, navigate to homepage');
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

  const testThemeStyles = (
    darkMode: boolean,
    expectedBgClass: string,
    expectedTextClass: string
  ) => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode,
      setDarkMode: jest.fn(),
    });

    const { container } = renderWithProviders(
      <DesktopNavbar session={nullSession} language="en" setLanguage={() => {}} />
    );

    const navbar = container.firstChild as HTMLElement;
    expect(navbar.className).toContain(expectedBgClass);
    expect(navbar.className).toContain(expectedTextClass);
  };

  it('applies dark mode styles', () => {
    testThemeStyles(true, 'bg-capx-dark-box-bg', 'text-capx-dark-text');
  });

  it('applies light mode styles', () => {
    testThemeStyles(false, 'bg-capx-light-bg', 'text-capx-light-text');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
