import { render, screen, fireEvent } from '@testing-library/react';
import BaseButton from '../../components/BaseButton';
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

describe('BaseButton', () => {
  beforeEach(() => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  it('renders button with label', () => {
    const handleClick = jest.fn();
    renderWithProviders(<BaseButton label="Test Button" onClick={handleClick} />);

    const button = screen.getByText('Test Button');
    expect(button).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    renderWithProviders(<BaseButton label="Test Button" onClick={handleClick} />);

    const button = screen.getByText('Test Button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies custom class', () => {
    const customClass = 'test-custom-class';
    renderWithProviders(
      <BaseButton label="Test Button" onClick={() => {}} customClass={customClass} />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });

  it('renders disabled state', () => {
    renderWithProviders(<BaseButton label="Test Button" onClick={() => {}} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders with image', () => {
    renderWithProviders(
      <BaseButton
        label="Test Button"
        onClick={() => {}}
        imageUrl="/test-image.svg"
        imageAlt="Test Image"
        imageWidth={24}
        imageHeight={24}
      />
    );

    const image = screen.getByAltText('Test Image');
    expect(image).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
