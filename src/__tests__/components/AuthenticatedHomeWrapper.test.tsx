import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AuthenticatedHomeWrapper from '@/app/(auth)/home/components/AuthenticatedHomeWrapper';
import { useSession } from 'next-auth/react';
import * as stores from '@/stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
    'body-home-section01-description': 'Discover',
    'body-home-section01-description-unified-login-info': 'Login info',
    'body-loggedin-home-third-section-title': 'Contact',
    'body-loggedin-home-third-section-description': 'Email us',
    'body-loggedin-home-third-section-button': 'Copy',
    'body-loggedin-home-third-section-button-success': 'Copied!',
    'complete-your-profile': 'Complete your profile',
    'auth-dialog-button-close': 'Close',
    'auth-dialog-button-continue': 'Continue',
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
  RecommendationCarouselSkeleton: () => <div>Loading skeleton</div>,
}));

// AuthenticatedMainSection renders SectionRecommendationsCarousel which has many deep deps.
jest.mock('@/app/(auth)/home/components/SectionRecommendationsCarousel', () => ({
  __esModule: true,
  default: () => <div data-testid="section-recommendations-carousel" />,
}));

jest.mock('@/utils/checkProfileCompleteness', () => ({
  isProfileIncomplete: jest.fn(() => false),
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

// Mock Popup and IncompleteProfilePopup to simplify tests
jest.mock('@/components/Popup', () => ({
  __esModule: true,
  default: ({ title, onContinue, onClose }: any) => (
    <div data-testid="popup">
      <div>{title}</div>
      <button onClick={onContinue}>Continue</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('@/components/IncompleteProfilePopup', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onContinue }: any) =>
    isOpen ? (
      <div data-testid="incomplete-profile-popup">
        <button onClick={onClose}>Dismiss</button>
        <button onClick={onContinue}>Complete Profile</button>
      </div>
    ) : null,
}));

function renderWrapper(isFirstLogin = false) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthenticatedHomeWrapper isFirstLogin={isFirstLogin} />
    </QueryClientProvider>
  );
}

describe('AuthenticatedHomeWrapper', () => {
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

  it('renders without crashing', () => {
    const { container } = renderWrapper();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders the main section', () => {
    renderWrapper();
    expect(screen.getByText('Welcome to CapX')).toBeInTheDocument();
  });

  it('does NOT show first-login popup when isFirstLogin is false', () => {
    renderWrapper(false);
    expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
  });

  it('shows first-login popup when isFirstLogin is true', () => {
    renderWrapper(true);
    expect(screen.getByTestId('popup')).toBeInTheDocument();
    expect(screen.getByText('Complete your profile')).toBeInTheDocument();
  });

  it('navigates to profile/edit when popup continue is clicked', () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    renderWrapper(true);
    screen.getByText('Continue').click();
    expect(mockPush).toHaveBeenCalledWith('/profile/edit');
  });

  it('does NOT show incomplete profile popup when profile is complete', async () => {
    const { useProfile } = require('@/hooks/useProfile');
    const { isProfileIncomplete } = require('@/utils/checkProfileCompleteness');

    (useProfile as jest.Mock).mockReturnValue({
      profile: { id: 1, username: 'user', skills_known: [1], skills_available: [1] },
      isLoading: false,
    });
    (isProfileIncomplete as jest.Mock).mockReturnValue(false);

    renderWrapper(false);
    await waitFor(() => {
      expect(screen.queryByTestId('incomplete-profile-popup')).not.toBeInTheDocument();
    });
  });

  it('shows incomplete profile popup when profile is incomplete', async () => {
    const { useProfile } = require('@/hooks/useProfile');
    const { isProfileIncomplete } = require('@/utils/checkProfileCompleteness');

    (useProfile as jest.Mock).mockReturnValue({
      profile: { id: 1, username: 'user', skills_known: [], skills_available: [] },
      isLoading: false,
    });
    (isProfileIncomplete as jest.Mock).mockReturnValue(true);

    renderWrapper(false);
    await waitFor(() => {
      expect(screen.getByTestId('incomplete-profile-popup')).toBeInTheDocument();
    });
  });

  it('navigates to profile/edit when incomplete profile popup continue is clicked', async () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const { useProfile } = require('@/hooks/useProfile');
    const { isProfileIncomplete } = require('@/utils/checkProfileCompleteness');

    (useProfile as jest.Mock).mockReturnValue({
      profile: { id: 1, username: 'user', skills_known: [], skills_available: [] },
      isLoading: false,
    });
    (isProfileIncomplete as jest.Mock).mockReturnValue(true);

    renderWrapper(false);

    await waitFor(() => {
      expect(screen.getByTestId('incomplete-profile-popup')).toBeInTheDocument();
    });

    screen.getByText('Complete Profile').click();
    expect(mockPush).toHaveBeenCalledWith('/profile/edit');
  });

  it('does not show popup when profile is still loading', async () => {
    const { useProfile } = require('@/hooks/useProfile');

    (useProfile as jest.Mock).mockReturnValue({
      profile: null,
      isLoading: true,
    });

    renderWrapper(false);
    await waitFor(() => {
      expect(screen.queryByTestId('incomplete-profile-popup')).not.toBeInTheDocument();
    });
  });
});
