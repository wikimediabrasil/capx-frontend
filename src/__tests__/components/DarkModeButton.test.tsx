import { render, screen, fireEvent } from '@testing-library/react';
import DarkModeButton from '../../components/DarkModeButton';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';

// Mock do Next.js Router
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

// Mock do useTheme
jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

describe('DarkModeButton', () => {
  const mockSetDarkMode = jest.fn();

  beforeEach(() => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: mockSetDarkMode,
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
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
    const darkModeIcon = screen.getByAltText('Dark Mode');
    expect(darkModeIcon).toBeInTheDocument();
  });

  it('shows light mode icon in dark mode', () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: true,
      setDarkMode: mockSetDarkMode,
    });

    renderWithProviders(<DarkModeButton />);
    const lightModeIcon = screen.getByAltText('Light Mode');
    expect(lightModeIcon).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
