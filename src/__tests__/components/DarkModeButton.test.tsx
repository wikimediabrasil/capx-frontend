import * as AppContext from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';
import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/react';
import DarkModeButton from '../../components/DarkModeButton';
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

// useTheme's mock
jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

// useApp's mock
jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: jest.fn(),
}));

describe('DarkModeButton', () => {
  const mockSetDarkMode = jest.fn();
  const mockPageContent = createMockPageContent({
    'alt-light-mode': 'Switch to light mode',
    'alt-dark-mode': 'Switch to dark mode',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (ThemeContext.useTheme as jest.Mock).mockReturnValue(
      createMockThemeContext(false, { setDarkMode: mockSetDarkMode })
    );
    (AppContext.useApp as jest.Mock).mockReturnValue({ pageContent: mockPageContent });
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
    (ThemeContext.useTheme as jest.Mock).mockReturnValue(
      createMockThemeContext(darkMode, { setDarkMode: mockSetDarkMode })
    );

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

    (AppContext.useApp as jest.Mock).mockReturnValue({ pageContent: customPageContent });
    renderWithProviders(<DarkModeButton />);
    expect(screen.getByAltText('Mudar para modo escuro')).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
