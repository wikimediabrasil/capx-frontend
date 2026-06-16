import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthenticatedMainSection from '@/app/(auth)/home/components/AuthenticatedMainSection';
import { useSession } from 'next-auth/react';
import * as stores from '@/stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

// Full stores mock
jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  useThemeStore: Object.assign(
    jest.fn(() => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() })),
    {
      getState: () => ({
        darkMode: false,
        setDarkMode: jest.fn(),
        mounted: true,
        hydrate: jest.fn(),
      }),
    }
  ),
  useIsMobile: jest.fn(() => false),
  usePageContent: jest.fn(() => ({
    'body-loggedin-home-main-section-title': 'Welcome to CapX',
    'body-loggedin-home-main-section-description': 'Connect with peers',
    'body-loggedin-home-main-section-button01': 'Browse Feed',
    'body-loggedin-home-main-section-button02': 'My Profile',
    'body-home-section01-description': 'Discover capacities',
    'body-home-section01-description-unified-login-info': 'Login with your Wikimedia account',
    'body-loggedin-home-third-section-title': 'Get in Touch',
    'body-loggedin-home-third-section-description': 'Contact us at capx@wmnobrasil.org',
    'body-loggedin-home-third-section-button': 'Copy Email',
    'body-loggedin-home-third-section-button-success': 'Email copied!',
    'home-qr-cta-title': 'Share your CapX profile',
    'home-qr-cta-description': 'Generate a QR code',
    'home-qr-cta-button': 'Go to my profile',
    'home-capacity-cta-title': 'Three new ways to explore capacities',
    'home-capacity-cta-description': 'Find the view that works best for you.',
    'home-capacity-cta-button': 'Explore capacities',
    'home-translate-cta-title': 'Translate capacities',
    'home-translate-cta-description': 'Help translate',
    'home-translate-cta-button': 'Translate & contribute',
  })),
  useLanguage: jest.fn(() => 'en'),
  useMobileMenuStatus: jest.fn(() => false),
  useAppStore: Object.assign(
    jest.fn(() => ({
      isMobile: false,
      mobileMenuStatus: false,
      language: 'en',
      pageContent: {},
      session: null,
      mounted: true,
      setMobileMenuStatus: jest.fn(),
      setLanguage: jest.fn(),
      setPageContent: jest.fn(),
      setSession: jest.fn(),
      setIsMobile: jest.fn(),
      hydrate: jest.fn(),
    })),
    {
      getState: () => ({
        isMobile: false,
        mobileMenuStatus: false,
        language: 'en',
        pageContent: {},
        session: null,
        mounted: true,
        setMobileMenuStatus: jest.fn(),
        setLanguage: jest.fn(),
        setPageContent: jest.fn(),
        setSession: jest.fn(),
        setIsMobile: jest.fn(),
        hydrate: jest.fn(),
      }),
    }
  ),
  useCapacityStore: Object.assign(
    jest.fn(() => ({
      capacities: {},
      children: {},
      language: 'en',
      timestamp: 0,
      isLoadingTranslations: false,
      isLoaded: false,
      getName: jest.fn(() => ''),
      getDescription: jest.fn(() => ''),
      getWdCode: jest.fn(() => ''),
      getMetabaseCode: jest.fn(() => ''),
      getColor: jest.fn(() => '#000'),
      getIcon: jest.fn(() => '/icons/test.svg'),
      getChildren: jest.fn(() => []),
      getCapacity: jest.fn(() => null),
      getRootCapacities: jest.fn(() => []),
      hasChildren: jest.fn(() => false),
      isFallbackTranslation: jest.fn(() => false),
      getIsLoaded: jest.fn(() => false),
      getIsDescriptionsReady: jest.fn(() => false),
      updateLanguage: jest.fn(),
      preloadCapacities: jest.fn(),
      clearCache: jest.fn(),
      setCache: jest.fn(),
      invalidateQueryCache: jest.fn(),
    })),
    {
      getState: () => ({
        capacities: {},
        children: {},
        language: 'en',
        timestamp: 0,
        isLoadingTranslations: false,
        isLoaded: false,
      }),
    }
  ),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/hooks/useProfile', () => ({
  useProfile: jest.fn(() => ({ profile: null, isLoading: false })),
}));

jest.mock('@/hooks/useRecommendations', () => ({
  useRecommendations: jest.fn(() => ({ data: null, isLoading: false, error: null })),
}));

jest.mock('@/hooks/useUserCapacities', () => ({
  useUserCapacities: jest.fn(() => ({
    userKnownCapacities: [],
    userAvailableCapacities: [],
    userWantedCapacities: [],
  })),
}));

jest.mock('@/hooks/useStatistics', () => ({
  useStatistics: jest.fn(() => ({ data: null, isLoading: false })),
}));

jest.mock('@/hooks/useTerritories', () => ({
  useTerritories: jest.fn(() => ({ territoriesMap: {}, loading: false })),
}));

jest.mock('@/hooks/useOrganizationDisplayName', () => ({
  useOrganizationDisplayName: jest.fn(() => ({ displayName: '' })),
}));

jest.mock('@/hooks/useProfileImage', () => ({
  useProfileImage: jest.fn(() => ({ profileImageUrl: null })),
}));

jest.mock('@/hooks/useSavedItems', () => ({
  useSavedItems: jest.fn(() => ({
    savedItems: [],
    createSavedItem: jest.fn(),
    deleteSavedItem: jest.fn(),
  })),
}));

jest.mock('@/app/providers/SnackbarProvider', () => ({
  useSnackbar: jest.fn(() => ({ showSnackbar: jest.fn() })),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(() => ({ data: null, isLoading: false })),
  useQueryClient: jest.fn(() => ({
    getQueryData: jest.fn(() => null),
    setQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
  })),
}));

jest.mock('@/services/userService', () => ({
  userService: { fetchUserProfile: jest.fn() },
}));

jest.mock('@/services/profileService', () => ({
  profileService: { updateProfile: jest.fn() },
}));

jest.mock('@/components/skeletons', () => ({
  RecommendationCarouselSkeleton: ({ type }: { type: string }) => (
    <div data-testid={`skeleton-${type}`}>Loading...</div>
  ),
}));

// AuthenticatedMainSection renders SectionRecommendationsCarousel which has many deep deps.
jest.mock('@/app/(auth)/home/components/SectionRecommendationsCarousel', () => ({
  __esModule: true,
  default: () => <div data-testid="section-recommendations-carousel" />,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, quality, placeholder, blurDataURL, ...imgProps } = props;
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

const defaultPageContent = {
  'body-loggedin-home-main-section-title': 'Welcome to CapX',
  'body-loggedin-home-main-section-description': 'Connect with peers',
  'body-loggedin-home-main-section-button01': 'Browse Feed',
  'body-loggedin-home-main-section-button02': 'My Profile',
  'body-home-section01-description': 'Discover capacities',
  'body-home-section01-description-unified-login-info': 'Login with your Wikimedia account',
  'body-loggedin-home-third-section-title': 'Get in Touch',
  'body-loggedin-home-third-section-description': 'Contact us at capx@wmnobrasil.org',
  'body-loggedin-home-third-section-button': 'Copy Email',
  'body-loggedin-home-third-section-button-success': 'Email copied!',
};

function renderComponent(pageContentOverrides = {}, props = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthenticatedMainSection
        pageContent={{ ...defaultPageContent, ...pageContentOverrides }}
        {...props}
      />
    </QueryClientProvider>
  );
}

describe('AuthenticatedMainSection', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mock-token', id: '1', name: 'Test User' } },
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Desktop rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders main section title', () => {
      renderComponent();
      expect(screen.getByText('Welcome to CapX')).toBeInTheDocument();
    });

    it('renders Browse Feed button', () => {
      renderComponent();
      expect(screen.getByText('Browse Feed')).toBeInTheDocument();
    });

    it('renders My Profile button', () => {
      renderComponent();
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });

    it('renders carousel navigation buttons', () => {
      renderComponent();
      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
    });

    it('renders carousel dot navigation', () => {
      renderComponent();
      expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 3')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 4')).toBeInTheDocument();
    });
  });

  describe('Mobile rendering', () => {
    it('renders mobile layout', () => {
      (stores.useIsMobile as jest.Mock).mockReturnValue(true);
      renderComponent();
      expect(screen.getByText('Welcome to CapX')).toBeInTheDocument();
    });
  });

  describe('Dark mode', () => {
    it('applies dark mode classes', () => {
      (stores.useDarkMode as jest.Mock).mockReturnValue(true);
      const { container } = renderComponent();
      const darkBg = container.querySelector('.bg-capx-dark-box-bg');
      expect(darkBg).toBeInTheDocument();
    });
  });

  describe('Slide navigation', () => {
    it('navigates to next slide when next button clicked', () => {
      renderComponent();
      const firstDot = screen.getByLabelText('Go to slide 1');
      expect(firstDot).toHaveClass('bg-[#851970]');

      const nextBtn = screen.getByLabelText('Next slide');
      fireEvent.click(nextBtn);

      const secondDot = screen.getByLabelText('Go to slide 2');
      expect(secondDot).toHaveClass('bg-[#851970]');
    });

    it('navigates to previous slide when prev button clicked', () => {
      renderComponent();

      // go to slide 2 first
      fireEvent.click(screen.getByLabelText('Next slide'));
      // now go back
      fireEvent.click(screen.getByLabelText('Previous slide'));

      const firstDot = screen.getByLabelText('Go to slide 1');
      expect(firstDot).toHaveClass('bg-[#851970]');
    });

    it('navigates to specific slide when dot clicked', () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Go to slide 3'));

      const thirdDot = screen.getByLabelText('Go to slide 3');
      expect(thirdDot).toHaveClass('bg-[#851970]');
    });

    it('wraps around to last slide when prev is clicked from slide 1', () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Previous slide'));

      const lastDot = screen.getByLabelText('Go to slide 4');
      expect(lastDot).toHaveClass('bg-[#851970]');
    });

    it('wraps around to first slide when next is clicked from last slide', () => {
      renderComponent();

      // Go to last slide (slide 4)
      fireEvent.click(screen.getByLabelText('Go to slide 4'));
      fireEvent.click(screen.getByLabelText('Next slide'));

      const firstDot = screen.getByLabelText('Go to slide 1');
      expect(firstDot).toHaveClass('bg-[#851970]');
    });

    it('auto-advances slides after interval', async () => {
      renderComponent({ slideInterval: 100 });

      const firstDot = screen.getByLabelText('Go to slide 1');
      expect(firstDot).toHaveClass('bg-[#851970]');

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        const secondDot = screen.getByLabelText('Go to slide 2');
        expect(secondDot).toHaveClass('bg-[#851970]');
      });
    });
  });

  describe('Router navigation', () => {
    it('navigates to /feed when Browse Feed is clicked', () => {
      const { useRouter } = require('next/navigation');
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

      renderComponent();
      fireEvent.click(screen.getByText('Browse Feed'));
      expect(mockPush).toHaveBeenCalledWith('/feed');
    });

    it('navigates to /profile when My Profile is clicked', () => {
      const { useRouter } = require('next/navigation');
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

      renderComponent();
      fireEvent.click(screen.getByText('My Profile'));
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  describe('Third section', () => {
    it('renders third section title', () => {
      renderComponent();
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('renders third section description', () => {
      renderComponent();
      expect(screen.getByText('Contact us at capx@wmnobrasil.org')).toBeInTheDocument();
    });

    it('renders copy email button', () => {
      renderComponent();
      expect(screen.getByText('Copy Email')).toBeInTheDocument();
    });

    it('shows snackbar after copying email', () => {
      const mockShowSnackbar = jest.fn();
      (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar });

      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
      });

      renderComponent();
      fireEvent.click(screen.getByText('Copy Email'));
      expect(mockShowSnackbar).toHaveBeenCalledWith('Email copied!', 'success');
    });
  });
});
