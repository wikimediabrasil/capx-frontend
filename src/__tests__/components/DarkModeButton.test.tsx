import * as AppContext from '@/contexts/AppContext';
import { AppProvider } from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import DarkModeButton from '../../components/DarkModeButton';

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

  beforeEach(() => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: mockSetDarkMode,
    });

    (AppContext.useApp as jest.Mock).mockReturnValue({
      pageContent: {
        'alt-light-mode': 'Switch to light mode',
        'alt-dark-mode': 'Switch to dark mode',
      },
    });
  });

  const renderWithProviders = (component: React.ReactNode, darkMode = false) => {
    return render(
      <ThemeProvider>
        <AppProvider>
          <div data-testid="test-container">{component}</div>
        </AppProvider>
      </ThemeProvider>
    );
  };

  it('renders dark mode button', () => {
    renderWithProviders(<DarkModeButton />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('toggles dark mode when clicked', () => {
    renderWithProviders(<DarkModeButton />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(mockSetDarkMode).toHaveBeenCalledWith(true);
  });

  it('shows dark mode icon in light mode', () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: mockSetDarkMode,
    });

    renderWithProviders(<DarkModeButton />);
    const darkModeIcon = screen.getByAltText('Switch to dark mode');
    expect(darkModeIcon).toBeInTheDocument();
  });

  it('shows light mode icon in dark mode', () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: true,
      setDarkMode: mockSetDarkMode,
    });

    renderWithProviders(<DarkModeButton />);
    const lightModeIcon = screen.getByAltText('Switch to light mode');
    expect(lightModeIcon).toBeInTheDocument();
  });

  it('uses pageContent for alt text when available', () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: mockSetDarkMode,
    });

    (AppContext.useApp as jest.Mock).mockReturnValue({
      pageContent: {
        'alt-light-mode': 'Mudar para modo claro',
        'alt-dark-mode': 'Mudar para modo escuro',
      },
    });

    renderWithProviders(<DarkModeButton />);
    const darkModeIcon = screen.getByAltText('Mudar para modo escuro');
    expect(darkModeIcon).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
