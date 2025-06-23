import { render, screen } from '@testing-library/react';
import CallToActionSection from '@/components/CallToActionSection';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';

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

// ThemeContext mock
jest.mock('@/contexts/ThemeContext', () => {
  const originalModule = jest.requireActual('@/contexts/ThemeContext');
  return {
    ...originalModule,
    useTheme: () => ({
      darkMode: false,
      setDarkMode: jest.fn(),
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// AppContext mock
jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: () => ({
    pageContent: {
      'body-home-section01-call-to-action-title': 'Join the Exchange',
      'body-home-section01-call-to-action-description': 'Connect with peers',
      'body-home-section01-call-to-action-button01': 'Join Now',
      'body-home-section01-call-to-action-button02': 'Create Account',
    },
    isMobile: false,
  }),
  AppProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('CallToActionSection', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  it('renders main content correctly', () => {
    renderWithProviders(<CallToActionSection />);

    expect(screen.getByText('Join the Exchange')).toBeInTheDocument();
    expect(screen.getByText('Connect with peers')).toBeInTheDocument();
    expect(screen.getByText('Join Now')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('applies light mode styles', () => {
    const { container } = renderWithProviders(<CallToActionSection />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-capx-light-bg');
  });

  it('renders mobile version correctly', () => {
    jest.spyOn(require('@/contexts/AppContext'), 'useApp').mockImplementation(() => ({
      pageContent: {
        'body-home-section01-call-to-action-title': 'Join the Exchange',
        'body-home-section01-call-to-action-description': 'Connect with peers',
        'body-home-section01-call-to-action-button01': 'Join Now',
        'body-home-section01-call-to-action-button02': 'Create Account',
      },
      isMobile: true,
    }));

    const { container } = renderWithProviders(<CallToActionSection />);

    expect(container.querySelector('.flex-col')).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
