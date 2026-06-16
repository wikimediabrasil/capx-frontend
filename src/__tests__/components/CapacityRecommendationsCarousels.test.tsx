import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import CapacityRecommendationsCarousels from '@/app/(auth)/home/components/CapacityRecommendationsCarousels';
import { CapacityRecommendation } from '@/types/recommendation';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import * as stores from '@/stores';
import {
  renderWithProviders,
  cleanupMocks,
  setupCommonMocks,
  createMockCapacityCache,
  createMockQueryClient,
  createMockSnackbar,
  createMockRouter,
  mockScrollMethods,
} from '../helpers/recommendationTestHelpers';

jest.mock('@/stores', () => {
  const { createStoresMock } = require('../helpers/componentTestHelpers');
  return createStoresMock({
    pageContent: {
      'recommendations-known-available-skills': 'Recommended Capacities to Share',
      'recommendations-new-skills': 'Recommended Capacities',
      'add-to-profile': 'Add to Profile',
      added: 'Added',
      view: 'View',
      loading: 'Loading...',
      'capacity-icon': 'Capacity icon',
      'recommendations-based-on-profile': 'Based on your profile',
    },
    capacityStore: true,
  });
});

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/app/providers/SnackbarProvider');
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));
jest.mock('@/services/profileService', () => ({
  profileService: { updateProfile: jest.fn() },
}));
jest.mock('@/services/userService');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, quality, placeholder, blurDataURL, ...imgProps } = props;
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));
jest.mock('next/navigation');

const makeCapacity = (id: number, name: string): CapacityRecommendation => ({
  id,
  skill_wikidata_item: `Q${id}`,
  skill_type: 1,
  name,
  description: `${name} description`,
  color: 'learning',
});

const mockUserProfile = {
  id: 1,
  username: 'user',
  skills_known: [],
  skills_available: [],
  skills_wanted: [],
  language: ['en'],
};

describe('CapacityRecommendationsCarousels', () => {
  const mockSnackbar = createMockSnackbar();
  const mockQueryClient = createMockQueryClient();
  const mockCapacityCache = createMockCapacityCache();
  const mockRouter = createMockRouter();

  beforeEach(() => {
    jest.clearAllMocks();
    mockScrollMethods();

    const { useRouter } = require('next/navigation');
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    setupCommonMocks(useSession as jest.Mock);

    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
    (stores.useIsMobile as jest.Mock).mockReturnValue(false);
    (stores.useCapacityStore as jest.Mock).mockReturnValue(mockCapacityCache);
    (useSnackbar as jest.Mock).mockReturnValue(mockSnackbar);
    (useQuery as jest.Mock).mockReturnValue({ data: mockUserProfile, isLoading: false });
    mockQueryClient.getQueryData.mockReturnValue(mockUserProfile);
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
  });

  afterEach(cleanupMocks);

  it('renders without crashing with empty lists', () => {
    const { container } = renderWithProviders(
      <CapacityRecommendationsCarousels
        capacitiesToShare={[]}
        capacitiesToLearn={[]}
        userProfile={null}
      />
    );
    // When both lists are empty, nothing is rendered
    expect(container.firstChild).toBeNull();
  });

  it('renders share carousel when capacitiesToShare is non-empty', async () => {
    renderWithProviders(
      <CapacityRecommendationsCarousels
        capacitiesToShare={[makeCapacity(1, 'Teaching')]}
        capacitiesToLearn={[]}
        userProfile={mockUserProfile as any}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Recommended Capacities to Share')).toBeInTheDocument();
    });
  });

  it('renders learn carousel when capacitiesToLearn is non-empty', async () => {
    renderWithProviders(
      <CapacityRecommendationsCarousels
        capacitiesToShare={[]}
        capacitiesToLearn={[makeCapacity(2, 'Coding')]}
        userProfile={mockUserProfile as any}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Recommended Capacities')).toBeInTheDocument();
    });
  });

  it('renders both carousels when both lists are non-empty', async () => {
    renderWithProviders(
      <CapacityRecommendationsCarousels
        capacitiesToShare={[makeCapacity(1, 'Teaching')]}
        capacitiesToLearn={[makeCapacity(2, 'Coding')]}
        userProfile={mockUserProfile as any}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Recommended Capacities to Share')).toBeInTheDocument();
      expect(screen.getByText('Recommended Capacities')).toBeInTheDocument();
    });
  });

  it('renders capacity names inside carousels', async () => {
    renderWithProviders(
      <CapacityRecommendationsCarousels
        capacitiesToShare={[makeCapacity(10, 'Leadership')]}
        capacitiesToLearn={[]}
        userProfile={mockUserProfile as any}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Leadership')).toBeInTheDocument();
    });
  });

  it('renders hint messages in cards', async () => {
    (stores.usePageContent as jest.Mock).mockReturnValue({
      'recommendations-known-available-skills': 'Recommended Capacities to Share',
      'recommendations-new-skills': 'Recommended Capacities',
      'recommendations-based-on-most-used-capacities': 'Based on most used capacities',
      'recommendation-based-on-capacities': 'Based on your capacities',
      'add-to-profile': 'Add to Profile',
      added: 'Added',
      view: 'View',
      loading: 'Loading...',
      'capacity-icon': 'Capacity icon',
      'recommendations-based-on-profile': 'Based on your profile',
    });

    renderWithProviders(
      <CapacityRecommendationsCarousels
        capacitiesToShare={[makeCapacity(1, 'Writing')]}
        capacitiesToLearn={[]}
        userProfile={mockUserProfile as any}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Based on most used capacities')).toBeInTheDocument();
    });
  });

  it('does not render share carousel when capacitiesToShare is empty', async () => {
    renderWithProviders(
      <CapacityRecommendationsCarousels
        capacitiesToShare={[]}
        capacitiesToLearn={[makeCapacity(2, 'Coding')]}
        userProfile={mockUserProfile as any}
      />
    );
    await waitFor(() => {
      expect(screen.queryByText('Recommended Capacities to Share')).not.toBeInTheDocument();
    });
  });

  it('does not render learn carousel when capacitiesToLearn is empty', async () => {
    renderWithProviders(
      <CapacityRecommendationsCarousels
        capacitiesToShare={[makeCapacity(1, 'Teaching')]}
        capacitiesToLearn={[]}
        userProfile={mockUserProfile as any}
      />
    );
    await waitFor(() => {
      expect(screen.queryByText('Recommended Capacities')).not.toBeInTheDocument();
    });
  });
});
