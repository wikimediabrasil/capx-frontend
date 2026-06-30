import { render, screen } from '@testing-library/react';
import CallToActionSection from '@/components/CallToActionSection';
import * as stores from '@/stores';
// renderWithProviders not needed here; using render directly

// Next.js Router mock
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

// next-auth mock
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('CallToActionSection', () => {
  it('renders main content correctly', () => {
    (stores.usePageContent as jest.Mock).mockReturnValue({
      'body-home-section01-call-to-action-title': 'Join the Exchange',
      'body-home-section01-call-to-action-description': 'Connect with peers',
      'body-home-section01-call-to-action-button01': 'Join Now',
      'body-home-section01-call-to-action-button02': 'Create Account',
    });

    render(<CallToActionSection />);

    expect(screen.getByText('Join the Exchange')).toBeInTheDocument();
    expect(screen.getByText('Connect with peers')).toBeInTheDocument();
    expect(screen.getByText('Join Now')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('applies light mode styles', () => {
    const { container } = render(<CallToActionSection />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-capx-light-bg');
  });

  it('renders mobile version correctly', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    (stores.usePageContent as jest.Mock).mockReturnValue({
      'body-home-section01-call-to-action-title': 'Join the Exchange',
      'body-home-section01-call-to-action-description': 'Connect with peers',
      'body-home-section01-call-to-action-button01': 'Join Now',
      'body-home-section01-call-to-action-button02': 'Create Account',
    });

    const { container } = render(<CallToActionSection />);

    expect(container.querySelector('.flex-col')).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
