import { render, screen } from '@testing-library/react';
import CallToActionSection from '@/components/CallToActionSection';
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

// Next.js Router mock
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

// next-auth mock
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('CallToActionSection', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <>{component}</>
        );
  };

  it('renders main content correctly', () => {
    (stores.usePageContent as jest.Mock).mockReturnValue({
      'body-home-section01-call-to-action-title': 'Join the Exchange',
      'body-home-section01-call-to-action-description': 'Connect with peers',
      'body-home-section01-call-to-action-button01': 'Join Now',
      'body-home-section01-call-to-action-button02': 'Create Account',
    });

    renderWithProviders(<CallToActionSection />);

    expect(screen.getByText('Join the Exchange')).toBeInTheDocument();
    expect(screen.getByText('Connect with peers')).toBeInTheDocument();
    expect(screen.getByText('Join Now')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('applies light mode styles', () => {
    const { container } = renderWithProviders(<CallToActionSection />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-capx-light-bg');
  });

  it('renders mobile version correctly', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    (stores.usePageContent as jest.Mock).mockReturnValue({
      'body-home-section01-call-to-action-title': 'Join the Exchange',
      'body-home-section01-call-to-action-description': 'Connect with peers',
      'body-home-section01-call-to-action-button01': 'Join Now',
      'body-home-section01-call-to-action-button02': 'Create Account',
    });

    const { container } = renderWithProviders(<CallToActionSection />);

    expect(container.querySelector('.flex-col')).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
