import { AppProvider } from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import { Session } from 'next-auth';
import MobileNavbar from '../../components/MobileNavbar';

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

// useApp's mock
const mockUseApp = jest.fn();

jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: () => mockUseApp(),
}));

// Axios's mock
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

// LanguageSelect's mock
jest.mock('../../components/LanguageSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="language-select-mock">Language Select</div>,
}));

const mockPageContent = {
  'sign-in-button': 'Sign in',
  'sign-out-button': 'Sign out',
  'alt-logo-main': 'CapX - Capacity Exchange logo, navigate to homepage',
  'alt-menu-close': 'Close navigation menu',
  'alt-burger-menu': 'Open main navigation menu',
};

describe('MobileNavbar', () => {
  const mockSetMobileMenuStatus = jest.fn();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // useTheme's mock
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });

    // useApp's mock
    mockUseApp.mockReturnValue({
      isMobile: true,
      mobileMenuStatus: false,
      setMobileMenuStatus: mockSetMobileMenuStatus,
      pageContent: mockPageContent,
      language: 'en',
      setLanguage: jest.fn(),
      setPageContent: jest.fn(),
      session: null,
      setSession: jest.fn(),
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>
          <div data-testid="test-container">
            {component}
          </div>
        </AppProvider>
      </ThemeProvider>
    );
  };

  it('renders logo correctly', () => {
    renderWithProviders(<MobileNavbar session={null} language="en" setLanguage={jest.fn()} />);

    const logo = screen.getByAltText('CapX - Capacity Exchange logo, navigate to homepage');
    expect(logo).toBeInTheDocument();
  });

  it('toggles mobile menu when burger menu is clicked', () => {
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

    renderWithProviders(
      <MobileNavbar session={validSession} language="en" setLanguage={jest.fn()} />
    );

    const burgerMenu = screen.getByAltText('Open main navigation menu');
    fireEvent.click(burgerMenu);

    // Verify if the function setMobileMenuStatus was called
    expect(mockSetMobileMenuStatus).toHaveBeenCalledWith(true);
  });

  it('applies dark mode styles', () => {
    // Mock useTheme to return darkMode as true
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: true,
      setDarkMode: jest.fn(),
    });

    const { container } = renderWithProviders(
      <MobileNavbar session={null} language="en" setLanguage={jest.fn()} />
    );

    // Find the navbar by the data-testid we added to the container
    const navbar = container.querySelector('div[class*="bg-capx-dark-box-bg"]');
    expect(navbar).toBeInTheDocument();
  });

  it('applies light mode styles', () => {
    // Mock useTheme to return darkMode as false
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });

    const { container } = renderWithProviders(
      <MobileNavbar session={null} language="en" setLanguage={jest.fn()} />
    );

    // Find the navbar by the data-testid we added to the container
    const navbar = container.querySelector('div[class*="bg-capx-light-bg"]');
    expect(navbar).toBeInTheDocument();
  });

  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});
