import * as stores from '@/stores';
import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/react';
import DarkModeButton from '../../components/DarkModeButton';

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
  renderWithProviders,
  createMockThemeContext,
  createMockPageContent,
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

describe('DarkModeButton', () => {
  const mockSetDarkMode = jest.fn();
  const mockPageContent = createMockPageContent({
    'alt-light-mode': 'Switch to light mode',
    'alt-dark-mode': 'Switch to dark mode',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
    (stores.useSetDarkMode as jest.Mock).mockReturnValue(mockSetDarkMode);
    (stores.usePageContent as jest.Mock).mockReturnValue(mockPageContent);
  });

  it('renders dark mode button', () => {
    renderWithProviders(<DarkModeButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('toggles dark mode when clicked', () => {
    renderWithProviders(<DarkModeButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetDarkMode).toHaveBeenCalledWith(true);
  });

  const testIconDisplay = (darkMode: boolean, expectedAltText: string) => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(darkMode);
    renderWithProviders(<DarkModeButton />);
    expect(screen.getByAltText(expectedAltText)).toBeInTheDocument();
  };

  it('shows dark mode icon in light mode', () => {
    testIconDisplay(false, 'Switch to dark mode');
  });

  it('shows light mode icon in dark mode', () => {
    testIconDisplay(true, 'Switch to light mode');
  });

  it('uses pageContent for alt text when available', () => {
    const customPageContent = createMockPageContent({
      'alt-light-mode': 'Mudar para modo claro',
      'alt-dark-mode': 'Mudar para modo escuro',
    });

    (stores.usePageContent as jest.Mock).mockReturnValue(customPageContent);
    renderWithProviders(<DarkModeButton />);
    expect(screen.getByAltText('Mudar para modo escuro')).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
