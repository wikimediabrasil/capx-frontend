import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AuthenticatedHomeWrapper from '@/app/(auth)/home/components/AuthenticatedHomeWrapper';
import { useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/stores', () => {
  const { createStoresMock } = require('../helpers/componentTestHelpers');
  return createStoresMock({
    pageContent: {
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
    },
    capacityStore: true,
  });
});

jest.mock('next-auth/react', () => require('../helpers/homeTestMocks').nextAuthMock);
jest.mock('@/hooks/useProfile', () => require('../helpers/homeTestMocks').useProfileMock);
jest.mock(
  '@/hooks/useRecommendations',
  () => require('../helpers/homeTestMocks').useRecommendationsMock
);
jest.mock(
  '@/hooks/useUserCapacities',
  () => require('../helpers/homeTestMocks').useUserCapacitiesMock
);
jest.mock('@/hooks/useStatistics', () => require('../helpers/homeTestMocks').useStatisticsMock);
jest.mock('@/hooks/useTerritories', () => require('../helpers/homeTestMocks').useTerritoriesMock);
jest.mock(
  '@/hooks/useOrganizationDisplayName',
  () => require('../helpers/homeTestMocks').useOrganizationDisplayNameMock
);
jest.mock('@/hooks/useProfileImage', () => require('../helpers/homeTestMocks').useProfileImageMock);
jest.mock('@/hooks/useSavedItems', () => require('../helpers/homeTestMocks').useSavedItemsMock);
jest.mock(
  '@/app/providers/SnackbarProvider',
  () => require('../helpers/homeTestMocks').snackbarProviderMock
);
jest.mock('@tanstack/react-query', () => require('../helpers/homeTestMocks').reactQueryMock());
jest.mock('@/services/userService', () => require('../helpers/homeTestMocks').userServiceMock);
jest.mock(
  '@/services/profileService',
  () => require('../helpers/homeTestMocks').profileServiceMock
);

jest.mock('@/components/skeletons', () => ({
  RecommendationCarouselSkeleton: () => <div>Loading skeleton</div>,
}));

jest.mock('@/app/(auth)/home/components/SectionRecommendationsCarousel', () => ({
  __esModule: true,
  default: () => <div data-testid="section-recommendations-carousel" />,
}));

jest.mock('@/utils/checkProfileCompleteness', () => ({
  isProfileIncomplete: jest.fn(() => false),
}));

jest.mock('next/image', () => {
  const { nextImageMock } = require('../helpers/componentTestHelpers');
  return nextImageMock();
});

jest.mock('next/navigation', () => {
  const { nextNavigationMock } = require('../helpers/componentTestHelpers');
  return nextNavigationMock();
});

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

  function setupProfileMocks(incomplete: boolean, loading = false) {
    const { useProfile } = require('@/hooks/useProfile');
    const { isProfileIncomplete } = require('@/utils/checkProfileCompleteness');
    const skills = incomplete ? [] : [1];
    (useProfile as jest.Mock).mockReturnValue({
      profile: loading
        ? null
        : { id: 1, username: 'user', skills_known: skills, skills_available: skills },
      isLoading: loading,
    });
    (isProfileIncomplete as jest.Mock).mockReturnValue(incomplete);
  }

  it('does NOT show incomplete profile popup when profile is complete', async () => {
    setupProfileMocks(false);
    renderWrapper(false);
    await waitFor(() => {
      expect(screen.queryByTestId('incomplete-profile-popup')).not.toBeInTheDocument();
    });
  });

  it('shows incomplete profile popup when profile is incomplete', async () => {
    setupProfileMocks(true);
    renderWrapper(false);
    await waitFor(() => {
      expect(screen.getByTestId('incomplete-profile-popup')).toBeInTheDocument();
    });
  });

  it('navigates to profile/edit when incomplete profile popup continue is clicked', async () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    setupProfileMocks(true);

    renderWrapper(false);
    await waitFor(() => {
      expect(screen.getByTestId('incomplete-profile-popup')).toBeInTheDocument();
    });

    screen.getByText('Complete Profile').click();
    expect(mockPush).toHaveBeenCalledWith('/profile/edit');
  });

  it('does not show popup when profile is still loading', async () => {
    setupProfileMocks(false, true);
    renderWrapper(false);
    await waitFor(() => {
      expect(screen.queryByTestId('incomplete-profile-popup')).not.toBeInTheDocument();
    });
  });
});
