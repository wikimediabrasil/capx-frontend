import { render } from '@testing-library/react';
import { Session } from 'next-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

/**
 * Shared test utilities and helpers
 */

// Session Mocks
export const createMockSession = (overrides?: Partial<Session>): Session => ({
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
  ...overrides,
});

export const nullSession: Session | null = null;

// Page Content Mocks
export const createMockPageContent = (overrides?: Record<string, string>) => ({
  'sign-in-button': 'Login',
  'sign-out-button': 'Logout',
  'navbar-link-home': 'Home',
  'navbar-link-capacities': 'Capacities',
  'navbar-link-reports': 'Reports',
  'navbar-link-feed': 'Feed',
  'navbar-link-saved': 'Saved',
  'navbar-link-report-bug': 'Report Bug',
  'alt-logo-main': 'CapX - Capacity Exchange logo, navigate to homepage',
  'organization-profile-add-a-diff-tag': 'Add a news tag',
  ...overrides,
});

// Render with Providers
export const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      
        {component}
      
    </QueryClientProvider>
  );
};

// Common Mock Return Values

);

export const createMockOrganization = (id = 1, name = 'Org 1') => ({
  id,
  display_name: name,
});

// Common test utilities
export const setupCommonMocks = () => {
  // Mock next/image
  jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, className, width, height, ...props }: any) => (
      <img src={src} alt={alt} className={className} width={width} height={height} {...props} />
    ),
  }));

  // Mock next/navigation
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
};

// Axios mock helper
export const setupAxiosMock = (axios: any) => {
  (axios.get as jest.Mock).mockImplementation((url: string) => {
    if (url.includes('/languages')) {
      return Promise.resolve({
        data: ['pt-BR', 'en', 'es'],
      });
    }
    return Promise.resolve({
      data: createMockPageContent(),
    });
  });
};

// Fetch mock helper for API tests
export const createMockFetchResponse = (data: any, ok = true) => ({
  ok,
  json: async () => data,
});

export const setupFetchMock = (responses: any[]) => {
  const mockFetch = globalThis.fetch as jest.Mock;
  responses.forEach(response => {
    mockFetch.mockResolvedValueOnce(response);
  });
};
