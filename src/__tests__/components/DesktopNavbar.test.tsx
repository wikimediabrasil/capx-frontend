import DesktopNavbar from '@/components/DesktopNavbar';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import { fireEvent, screen } from '@testing-library/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import * as stores from '@/stores';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  useThemeStore: Object.assign(
    jest.fn(() => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() })),
    { getState: () => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() }) }
  ),
  useIsMobile: jest.fn(() => false),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useMobileMenuStatus: jest.fn(() => false),
  useAppStore: Object.assign(
    jest.fn(() => ({ isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() })),
    { getState: () => ({ isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() }) }
  ),
}));

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

// axios's mock
jest.mock('axios');
setupAxiosMock(axios);

// LanguageSelect's mock
jest.mock('../../components/LanguageSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="language-select-mock">Language Select</div>,
}));

const mockPageContent = createMockPageContent();

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
    (stores.useDarkMode as jest.Mock).mockReturnValue(darkMode);

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
