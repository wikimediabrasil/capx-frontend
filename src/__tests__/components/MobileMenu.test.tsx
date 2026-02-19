import { render, screen } from '@testing-library/react';
import MobileMenu from '../../components/MobileMenu';
import { Session } from 'next-auth';
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
    jest.fn((selector?: any) => { const state = { isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() }; return selector ? selector(state) : state; }),
    { getState: () => ({ isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() }) }
  ),
}));

// Mocking the Next.js Router
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
  useParams() {
    return {};
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

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

describe('MobileMenu', () => {
  beforeEach(() => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
    (stores.usePageContent as jest.Mock).mockReturnValue({
      'sign-in-button': 'Login',
      'sign-out-button': 'Logout',
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
        <>{component}</>
        );
  };

  it('renders sign in button when not logged in', () => {
    renderWithProviders(<MobileMenu session={null} />);

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders sign out button when logged in', () => {
    renderWithProviders(<MobileMenu session={validSession} />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('applies dark mode styles', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);

    const { container } = renderWithProviders(<MobileMenu session={null} />);

    const menuDiv = container.firstChild;
    expect(menuDiv).toHaveClass('bg-capx-dark-box-bg');
    expect(menuDiv).toHaveClass('text-capx-light-bg');
  });

  it('applies light mode styles', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);

    const { container } = renderWithProviders(<MobileMenu session={null} />);

    const menuDiv = container.firstChild;
    expect(menuDiv).toHaveClass('bg-capx-light-bg');
    expect(menuDiv).toHaveClass('text-capx-dark-bg');
  });

  // Clean up the mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});
