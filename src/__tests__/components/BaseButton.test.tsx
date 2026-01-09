import { screen, fireEvent } from '@testing-library/react';
import BaseButton from '../../components/BaseButton';
import * as ThemeContext from '@/contexts/ThemeContext';
import { renderWithProviders, createMockThemeContext } from '../utils/test-helpers';

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
  const defaultOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (ThemeContext.useTheme as jest.Mock).mockReturnValue(createMockThemeContext(false));
  });

  const renderButton = (props: any = {}) => {
    return renderWithProviders(
      <BaseButton label="Test Button" onClick={defaultOnClick} {...props} />
    );
  };

  it('renders button with label', () => {
    renderButton();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('handles click events', () => {
    renderButton();
    fireEvent.click(screen.getByText('Test Button'));
    expect(defaultOnClick).toHaveBeenCalled();
  });

  it('applies custom class', () => {
    renderButton({ customClass: 'test-custom-class' });
    expect(screen.getByRole('button')).toHaveClass('test-custom-class');
  });

  it('renders disabled state', () => {
    renderButton({ disabled: true });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders with image', () => {
    renderButton({
      imageUrl: '/test-image.svg',
      imageAlt: 'Test Image',
      imageWidth: 24,
      imageHeight: 24,
    });

    expect(screen.getByAltText('Test Image')).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
