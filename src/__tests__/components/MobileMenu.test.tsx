import { render, screen } from '@testing-library/react';
import MobileMenu from '../../components/MobileMenu';
import { Session } from 'next-auth';
import * as stores from '@/stores';

// Mocking the Next.js Router
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
  useParams() {
    return {};
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

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

const renderWithProviders = (component: React.ReactNode) => {
  return render(<>{component}</>);
};

describe('MobileMenu', () => {
  beforeEach(() => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
    (stores.usePageContent as jest.Mock).mockReturnValue({
      'sign-in-button': 'Login',
      'sign-out-button': 'Logout',
    });
  });

  it('renders sign in button when not logged in', () => {
    renderWithProviders(<MobileMenu session={null} />);

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders sign out button when logged in', () => {
    renderWithProviders(<MobileMenu session={validSession} />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('applies dark mode styles', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);

    const { container } = renderWithProviders(<MobileMenu session={null} />);

    const menuDiv = container.firstChild;
    expect(menuDiv).toHaveClass('bg-capx-dark-box-bg');
    expect(menuDiv).toHaveClass('text-capx-light-bg');
  });

  it('applies light mode styles', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);

    const { container } = renderWithProviders(<MobileMenu session={null} />);

    const menuDiv = container.firstChild;
    expect(menuDiv).toHaveClass('bg-capx-light-bg');
    expect(menuDiv).toHaveClass('text-capx-dark-bg');
  });

  // Clean up the mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});
