import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import SectionRecommendationsCarousel from '@/app/(auth)/home/components/SectionRecommendationsCarousel';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import * as stores from '@/stores';
import {
  renderWithProviders,
  cleanupMocks,
  setupCommonMocks,
  mockScrollMethods,
  createMockSnackbar,
  createMockCapacityCache,
  createMockQueryClient,
  createMockRouter,
} from '../helpers/recommendationTestHelpers';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useQueryClient } from '@tanstack/react-query';

jest.mock('@/stores', () => {
  const { createStoresMock } = require('../helpers/componentTestHelpers');
  return createStoresMock({
    pageContent: {
      'recommendations-share-with': 'Profiles to share with',
      'recommendations-learn-from': 'Profiles to learn from',
      'recommendations-same-language': 'Same language speakers',
      'recommendations-known-available-skills': 'Recommended Capacities to Share',
      'recommendations-new-skills': 'Recommended Capacities',
      'recommendations-events-title': 'Upcoming Events',
      'recommendation-based-on-available-capacities': 'Based on your available capacities',
      'recommendation-based-on-wanted-capacities': 'Based on your wanted capacities',
      'recommendations-based-on-languages': 'Based on your languages',
      'recommendation-based-on-capacities': 'Based on your capacities',
      'recommendations-based-on-most-used-capacities': 'Based on most used capacities',
      'view-profile': 'View Profile',
      save: 'Save',
      'add-to-profile': 'Add to Profile',
      added: 'Added',
      view: 'View',
      loading: 'Loading...',
      'capacity-icon': 'Capacity icon',
      'recommendations-based-on-profile': 'Based on your profile',
      'home-analytics-cta-button': 'View Statistics',
    },
    capacityStore: true,
  });
});

jest.mock('next-auth/react', () => require('../helpers/homeTestMocks').nextAuthMock);

jest.mock('@/hooks/useRecommendations', () => ({
  useRecommendations: jest.fn(),
}));

jest.mock('@/hooks/useUserCapacities', () => require('../helpers/homeTestMocks').useUserCapacitiesMock);
jest.mock('@/hooks/useStatistics', () => require('../helpers/homeTestMocks').useStatisticsMock);
jest.mock('@/hooks/useTerritories', () => require('../helpers/homeTestMocks').useTerritoriesMock);

// AnalyticsCallToActionSection (rendered inside SectionRecommendationsCarousel) imports
// AnalyticsCallToActionSkeleton from AuthenticatedMainSection. Mock to avoid deep dep tree.
jest.mock('@/app/(auth)/home/components/AuthenticatedMainSection', () => ({
  __esModule: true,
  default: () => <div data-testid="authenticated-main-section" />,
  AnalyticsCallToActionSkeleton: () => (
    <div data-testid="analytics-skeleton" className="animate-pulse" />
  ),
}));

jest.mock('@/hooks/useOrganizationDisplayName', () => require('../helpers/homeTestMocks').useOrganizationDisplayNameMock);

jest.mock('@/hooks/useProfileImage', () => ({
  useProfileImage: jest.fn(() => ({ profileImageUrl: '/default-avatar.svg' })),
}));

jest.mock('@/hooks/useSavedItems', () => require('../helpers/homeTestMocks').useSavedItemsMock);
jest.mock('@/app/providers/SnackbarProvider', () => require('../helpers/homeTestMocks').snackbarProviderMock);

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/services/userService', () => require('../helpers/homeTestMocks').userServiceMock);
jest.mock('@/services/profileService', () => require('../helpers/homeTestMocks').profileServiceMock);

jest.mock('@/components/skeletons', () => ({
  RecommendationCarouselSkeleton: ({ type, cardCount }: { type: string; cardCount: number }) => (
    <div data-testid={`skeleton-${type}`}>
      Loading {type} skeleton x{cardCount}
    </div>
  ),
}));

jest.mock('next/image', () => {
  const { nextImageMock } = require('../helpers/componentTestHelpers');
  return nextImageMock();
});

jest.mock('next/navigation', () => {
  const { nextNavigationMock } = require('../helpers/componentTestHelpers');
  return nextNavigationMock();
});

const { useRecommendations } = require('@/hooks/useRecommendations');
const { useUserCapacities } = require('@/hooks/useUserCapacities');

const mockUserProfile = {
  id: 1,
  username: 'testuser',
  skills_known: [],
  skills_available: [],
  skills_wanted: [],
  language: ['en'],
};

const makeProfile = (id: number, name: string) => ({
  id,
  username: `user${id}`,
  display_name: name,
  profile_image: null,
});

const makeCapacity = (id: number) => ({
  id,
  skill_wikidata_item: `Q${id}`,
  skill_type: 1,
  name: `Capacity ${id}`,
  description: `Description ${id}`,
  color: 'learning',
});

const makeEvent = (id: number) => ({
  id,
  name: `Event ${id}`,
  time_begin: '2026-07-01T10:00:00Z',
  time_end: '2026-07-01T12:00:00Z',
  type_of_location: 'virtual',
});

describe('SectionRecommendationsCarousel', () => {
  const mockSnackbar = createMockSnackbar();
  const mockQueryClient = createMockQueryClient();
  const mockCapacityCache = createMockCapacityCache();
  const mockRouter = createMockRouter();

  beforeEach(() => {
    jest.clearAllMocks();
    mockScrollMethods();

    setupCommonMocks(useSession as jest.Mock);
    const { useRouter } = require('next/navigation');
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
    (stores.useIsMobile as jest.Mock).mockReturnValue(false);
    (stores.useCapacityStore as jest.Mock).mockReturnValue(mockCapacityCache);
    (useSnackbar as jest.Mock).mockReturnValue(mockSnackbar);

    mockQueryClient.getQueryData.mockReturnValue(mockUserProfile);
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);

    (useQuery as jest.Mock).mockReturnValue({ data: mockUserProfile, isLoading: false });

    useUserCapacities.mockReturnValue({
      userKnownCapacities: [],
      userAvailableCapacities: [],
      userWantedCapacities: [],
    });
  });

  afterEach(cleanupMocks);

  it('renders loading skeletons when data is loading', () => {
    useRecommendations.mockReturnValue({ data: null, isLoading: true, error: null });
    renderWithProviders(<SectionRecommendationsCarousel />);
    // Component renders multiple skeletons including two "profile" types
    const profileSkeletons = screen.getAllByTestId('skeleton-profile');
    expect(profileSkeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('returns null on error', () => {
    useRecommendations.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('fetch failed'),
    });
    const { container } = renderWithProviders(<SectionRecommendationsCarousel />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when data is null', () => {
    useRecommendations.mockReturnValue({ data: null, isLoading: false, error: null });
    const { container } = renderWithProviders(<SectionRecommendationsCarousel />);
    expect(container.firstChild).toBeNull();
  });

  it('shows SectionNoRecommendations when there are no recommendations at all', async () => {
    useRecommendations.mockReturnValue({
      data: {
        share_with: [],
        learn_from: [],
        same_language: [],
        share_with_orgs: [],
        learn_from_orgs: [],
        new_skills: [],
        events: [],
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SectionRecommendationsCarousel />);
    // SectionNoRecommendations renders CardNoRecommendations which uses page content
    await waitFor(() => {
      // No section carousels should appear
      expect(screen.queryByText('Profiles to share with')).not.toBeInTheDocument();
    });
  });

  it('renders share-with carousel when share_with profiles exist', async () => {
    useRecommendations.mockReturnValue({
      data: {
        share_with: [makeProfile(1, 'Alice')],
        learn_from: [],
        same_language: [],
        share_with_orgs: [],
        learn_from_orgs: [],
        new_skills: [],
        events: [],
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SectionRecommendationsCarousel />);
    await waitFor(() => {
      expect(screen.getByText('Profiles to share with')).toBeInTheDocument();
    });
  });

  it('renders learn-from carousel when learn_from profiles exist', async () => {
    useRecommendations.mockReturnValue({
      data: {
        share_with: [makeProfile(1, 'Alice')],
        learn_from: [makeProfile(2, 'Bob')],
        same_language: [],
        share_with_orgs: [],
        learn_from_orgs: [],
        new_skills: [],
        events: [],
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SectionRecommendationsCarousel />);
    await waitFor(() => {
      expect(screen.getByText('Profiles to learn from')).toBeInTheDocument();
    });
  });

  it('renders same-language carousel when same_language profiles exist', async () => {
    useRecommendations.mockReturnValue({
      data: {
        share_with: [makeProfile(1, 'Alice')],
        learn_from: [],
        same_language: [makeProfile(3, 'Carlos')],
        share_with_orgs: [],
        learn_from_orgs: [],
        new_skills: [],
        events: [],
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SectionRecommendationsCarousel />);
    await waitFor(() => {
      expect(screen.getByText('Same language speakers')).toBeInTheDocument();
    });
  });

  it('renders events carousel when events exist', async () => {
    useRecommendations.mockReturnValue({
      data: {
        share_with: [makeProfile(1, 'Alice')],
        learn_from: [],
        same_language: [],
        share_with_orgs: [],
        learn_from_orgs: [],
        new_skills: [],
        events: [makeEvent(1)],
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SectionRecommendationsCarousel />);
    await waitFor(() => {
      expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    });
  });

  it('combines share_with and share_with_orgs into one carousel', async () => {
    useRecommendations.mockReturnValue({
      data: {
        share_with: [makeProfile(1, 'Alice')],
        learn_from: [],
        same_language: [],
        share_with_orgs: [{ id: 10, display_name: 'Org One', acronym: 'OO', profile_image: null }],
        learn_from_orgs: [],
        new_skills: [],
        events: [],
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SectionRecommendationsCarousel />);
    await waitFor(() => {
      expect(screen.getByText('Profiles to share with')).toBeInTheDocument();
    });
  });

  it('shows only SectionNoCapacities and capacity carousels when only new_skills exist', async () => {
    useRecommendations.mockReturnValue({
      data: {
        share_with: [],
        learn_from: [],
        same_language: [],
        share_with_orgs: [],
        learn_from_orgs: [],
        new_skills: [makeCapacity(5), makeCapacity(6)],
        events: [],
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SectionRecommendationsCarousel />);
    await waitFor(() => {
      // No profile carousel
      expect(screen.queryByText('Profiles to share with')).not.toBeInTheDocument();
      // No event carousel
      expect(screen.queryByText('Upcoming Events')).not.toBeInTheDocument();
    });
  });
});
