import { render } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import { Session } from 'next-auth';

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
  return render(
    <ThemeProvider>
      <AppProvider>{component}</AppProvider>
    </ThemeProvider>
  );
};

// Common Mock Return Values
export const createMockAppContext = (overrides?: any) => {
  const defaultPageContent = overrides?.pageContent || createMockPageContent();
  return {
    isMobile: false,
    pageContent: defaultPageContent,
    language: 'en',
    mobileMenuStatus: false,
    setMobileMenuStatus: jest.fn(),
    setLanguage: jest.fn(),
    setPageContent: jest.fn(),
    session: null,
    setSession: jest.fn(),
    darkMode: false,
    setDarkMode: jest.fn(),
    isLoading: false,
    setIsLoading: jest.fn(),
    isMenuOpen: false,
    setIsMenuOpen: jest.fn(),
    ...overrides,
  };
};

export const createMockThemeContext = (darkMode = false, additionalProps?: any) => ({
  darkMode,
  setDarkMode: jest.fn(),
  theme: {
    fontSize: {
      mobile: { base: '14px' },
      desktop: { base: '24px' },
    },
  },
  getFontSize: () => ({ mobile: '14px', desktop: '24px' }),
  getBackgroundColor: () => (darkMode ? '#005B3F' : '#FFFFFF'),
  getTextColor: () => (darkMode ? '#FFFFFF' : '#000000'),
  ...additionalProps,
});

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
