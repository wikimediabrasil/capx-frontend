import { screen, fireEvent } from '@testing-library/react';
import BaseButton from '../../components/BaseButton';
import { renderWithProviders } from '../utils/test-helpers';

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

describe('BaseButton', () => {
  const defaultOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const DEFAULT_PROPS = {};
  const renderButton = (props: any = DEFAULT_PROPS) => {
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
