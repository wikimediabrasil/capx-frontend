import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import RecommendationKnownAndAvailableCapacityCard from '@/app/(auth)/home/components/RecommendationKnownAndAvailableCapacityCard';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { CapacityRecommendation } from '@/types/recommendation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import * as stores from '@/stores';
import {
  cleanupMocks,
  createMockCapacityCache,
  createMockQueryClient,
  createMockRouter,
  createMockSnackbar,
  createMockUserProfile,
  renderWithProviders,
  setupRecommendationCardMocks,
} from '../helpers/recommendationTestHelpers';

jest.mock('@/stores', () => {
  const { createStoresMock } = require('../helpers/componentTestHelpers');
  return createStoresMock({
    pageContent: {
      'add-to-profile': 'Add to Profile',
      added: 'Added',
      view: 'View',
      loading: 'Loading...',
      'capacity-added-success': 'Capacity added to profile',
      'capacity-icon': 'Capacity icon',
    },
    capacityStore: true,
  });
});

jest.mock('next-auth/react', () => require('../helpers/homeTestMocks').nextAuthMock);
jest.mock('@/app/providers/SnackbarProvider');
jest.mock('@tanstack/react-query', () => require('../helpers/homeTestMocks').reactQueryCardMock());
jest.mock(
  '@/services/profileService',
  () => require('../helpers/homeTestMocks').profileServiceMock
);
jest.mock('@/services/userService');
jest.mock('next/image', () => require('../helpers/componentTestHelpers').nextImageMock());
jest.mock('next/navigation');

const createMockCapacityRecommendation = (overrides = {}): CapacityRecommendation => ({
  id: 42,
  skill_wikidata_item: 'Q456',
  skill_type: 2,
  name: 'Teaching',
  description: 'Teaching capability',
  color: 'teaching',
  ...overrides,
});

const pageContent = {
  'add-to-profile': 'Add to Profile',
  added: 'Added',
  view: 'View',
  loading: 'Loading...',
  'capacity-added-success': 'Capacity added to profile',
  'capacity-icon': 'Capacity icon',
};

describe('RecommendationKnownAndAvailableCapacityCard', () => {
  const mockSnackbar = createMockSnackbar();
  const mockRouter = createMockRouter();
  const mockQueryClient = createMockQueryClient();
  const mockUserProfile = createMockUserProfile({ id: 123 });
  const mockCapacityCache = createMockCapacityCache();

  beforeEach(() => {
    jest.clearAllMocks();
    setupRecommendationCardMocks({
      useSession: useSession as jest.Mock,
      useSnackbar: useSnackbar as jest.Mock,
      useQuery: useQuery as jest.Mock,
      useQueryClient: useQueryClient as jest.Mock,
      stores,
      mockRouter,
      mockSnackbar,
      mockQueryClient,
      mockCapacityCache,
      mockUserProfile,
      pageContent,
    });
  });

  afterEach(cleanupMocks);

  const DEFAULT_PROPS: Record<string, any> = {};
  function renderCard(props: Record<string, any> = DEFAULT_PROPS) {
    return renderWithProviders(
      <RecommendationKnownAndAvailableCapacityCard
        recommendation={createMockCapacityRecommendation()}
        {...props}
      />
    );
  }

  it('renders without crashing', async () => {
    const { container } = renderCard();
    expect(container.firstChild).toBeInTheDocument();
  });

  it.each([
    ['capacity name', 'Teaching'],
    ['capacity description', 'Teaching capability'],
    ['Add to Profile button', 'Add to Profile'],
    ['View button', 'View'],
  ])('renders %s', async (_label, text) => {
    renderCard();
    await waitFor(() => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('renders hint message when provided', async () => {
    renderCard({ hintMessage: 'Share this capacity' });
    await waitFor(() => {
      expect(screen.getByText('Share this capacity')).toBeInTheDocument();
    });
  });

  it('shows Added button when capacity is already in known and available lists', async () => {
    mockQueryClient.getQueryData.mockImplementation((queryKey: any) => {
      if (Array.isArray(queryKey) && queryKey[0] === 'userProfile') {
        return { ...mockUserProfile, skills_known: ['42'], skills_available: ['42'] };
      }
      return undefined;
    });
    renderCard();
    await waitFor(() => {
      expect(screen.getByText('✓ Added')).toBeInTheDocument();
    });
  });

  it('renders in dark mode', async () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = renderCard();
    await waitFor(() => {
      expect(container.querySelector('.bg-gray-800')).toBeInTheDocument();
    });
  });

  it('renders capacity icon', async () => {
    renderCard();
    await waitFor(() => {
      expect(screen.getByAltText('Capacity icon')).toBeInTheDocument();
    });
  });
});
