import * as ThemeContext from '@/contexts/ThemeContext';
import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/react';
import axios from 'axios';
import MobileNavbar from '../../components/MobileNavbar';
import {
  createMockSession,
  createMockPageContent,
  renderWithProviders,
  setupAxiosMock,
  createMockThemeContext,
} from '../utils/test-helpers';

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
setupAxiosMock(axios);

// LanguageSelect's mock
jest.mock('../../components/LanguageSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="language-select-mock">Language Select</div>,
}));

const mockPageContent = createMockPageContent({
  'alt-menu-close': 'Close navigation menu',
  'alt-burger-menu': 'Open main navigation menu',
});

describe('MobileNavbar', () => {
  const mockSetMobileMenuStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (ThemeContext.useTheme as jest.Mock).mockReturnValue(createMockThemeContext(false));

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

  it('renders logo correctly', () => {
    renderWithProviders(<MobileNavbar session={null} language="en" setLanguage={jest.fn()} />);

    const logo = screen.getByAltText('CapX - Capacity Exchange logo, navigate to homepage');
    expect(logo).toBeInTheDocument();
  });

  it('toggles mobile menu when burger menu is clicked', () => {
    const validSession = createMockSession();

    renderWithProviders(
      <MobileNavbar session={validSession} language="en" setLanguage={jest.fn()} />
    );

    const burgerMenu = screen.getByAltText('Open main navigation menu');
    fireEvent.click(burgerMenu);

    expect(mockSetMobileMenuStatus).toHaveBeenCalledWith(true);
  });

  const testThemeStyles = (darkMode: boolean, expectedBgClass: string) => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue(createMockThemeContext(darkMode));

    const { container } = renderWithProviders(
      <MobileNavbar session={null} language="en" setLanguage={jest.fn()} />
    );

    const navbar = container.querySelector(`div[class*="${expectedBgClass}"]`);
    expect(navbar).toBeInTheDocument();
  };

  it('applies dark mode styles', () => {
    testThemeStyles(true, 'bg-capx-dark-box-bg');
  });

  it('applies light mode styles', () => {
    testThemeStyles(false, 'bg-capx-light-bg');
  });

  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});
