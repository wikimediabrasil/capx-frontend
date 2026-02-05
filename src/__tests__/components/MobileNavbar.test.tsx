import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/react';
import axios from 'axios';
import MobileNavbar from '../../components/MobileNavbar';
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

    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    (stores.useMobileMenuStatus as jest.Mock).mockReturnValue(false);
    (stores.usePageContent as jest.Mock).mockReturnValue(mockPageContent);
    (stores.useLanguage as jest.Mock).mockReturnValue('en');
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
    (stores.useDarkMode as jest.Mock).mockReturnValue(darkMode);

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
