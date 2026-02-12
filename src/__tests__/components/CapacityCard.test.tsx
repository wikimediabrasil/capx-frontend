import { CapacityCard } from '@/app/(auth)/capacity/components/CapacityCard';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';


jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  useThemeStore: Object.assign(
    jest.fn(() => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() })),
    { getState: () => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() }) }
  ),
  useIsMobile: jest.fn(() => false),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useMobileMenuStatus: jest.fn(() => false),
  useAppStore: Object.assign(
    jest.fn((selector?: any) => { const state = { isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() }; return selector ? selector(state) : state; }),
    { getState: () => ({ isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() }) }
  ),
  useCapacityStore: Object.assign(
    jest.fn(() => ({ capacities: {}, children: {}, language: 'en', timestamp: 0, isLoadingTranslations: false, isLoaded: false, getName: jest.fn(() => ''), getDescription: jest.fn(() => ''), getWdCode: jest.fn(() => ''), getMetabaseCode: jest.fn(() => ''), getColor: jest.fn(() => '#000'), getIcon: jest.fn(() => ''), getChildren: jest.fn(() => []), getCapacity: jest.fn(() => null), getRootCapacities: jest.fn(() => []), hasChildren: jest.fn(() => false), isFallbackTranslation: jest.fn(() => false), getIsLoaded: jest.fn(() => false), getIsDescriptionsReady: jest.fn(() => false), updateLanguage: jest.fn(), preloadCapacities: jest.fn(), clearCache: jest.fn(), setCache: jest.fn(), invalidateQueryCache: jest.fn() })),
    { getState: () => ({ capacities: {}, children: {}, language: 'en', timestamp: 0, isLoadingTranslations: false, isLoaded: false }) }
  ),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '123',
        token: 'test-token',
      },
    },
    status: 'authenticated',
  }),
}));

jest.mock('@/app/providers/SnackbarProvider', () => ({
  useSnackbar: () => ({
    showSnackbar: jest.fn(),
  }),
}));

jest.mock('@/hooks/useUserCapacities', () => ({
  useUserCapacities: () => ({
    userKnownCapacities: [],
    userAvailableCapacities: [],
    userWantedCapacities: [],
  }),
}));

jest.mock('@/services/userService', () => ({
  userService: {
    fetchUserProfile: jest.fn(() =>
      Promise.resolve({
        id: 123,
        skills_known: [],
        skills_available: [],
        skills_wanted: [],
        language: ['en'],
      })
    ),
  },
}));

jest.mock('@/services/profileService', () => ({
  profileService: {
    updateProfile: jest.fn(() => Promise.resolve({})),
  },
}));

const mockQueryClient = {
  getQueryData: jest.fn(() => ({
    id: 123,
    skills_known: [],
    skills_available: [],
    skills_wanted: [],
    language: ['en'],
  })),
  setQueryData: jest.fn(),
  invalidateQueries: jest.fn(),
};

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: {
      id: 123,
      skills_known: [],
      skills_available: [],
      skills_wanted: [],
      language: ['en'],
    },
    isLoading: false,
    isError: false,
  })),
  useQueryClient: jest.fn(() => mockQueryClient),
}));

describe('CapacityCard', () => {
  const mockProps = {
    code: 1,
    name: 'Test Capacity',
    icon: '/test-icon.svg',
    color: 'blue',
    onExpand: jest.fn(),
    isExpanded: false,
    hasChildren: true,
    description: 'Test description',
    wd_code: 'WD123',
    isRoot: true,
    onInfoClick: jest.fn().mockResolvedValue('Test description'),
  };

  it('renders root capacity card correctly', () => {
    render(<CapacityCard {...mockProps} />);

    expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    const images = screen.getAllByRole('img');
    expect(images.some(img => img.getAttribute('alt') === 'Test Capacity')).toBe(true);
  });

  it('calls onExpand when arrow button is clicked', () => {
    render(<CapacityCard {...mockProps} />);

    const expandButton = screen.getByAltText('Expand capacity');
    fireEvent.click(expandButton.closest('button') || expandButton);

    expect(mockProps.onExpand).toHaveBeenCalled();
  });

  it('shows info content when info button is clicked', async () => {
    render(<CapacityCard {...mockProps} />);

    const infoButton = screen.getByLabelText('Information');
    fireEvent.click(infoButton);

    expect(await screen.findByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('WD123')).toBeInTheDocument();
    expect(screen.getByText('Add to Known')).toBeInTheDocument();
    expect(screen.getByText('Add to Wanted')).toBeInTheDocument();
    expect(screen.getByText(/This will be added to your personal profile/i)).toBeInTheDocument();
    expect(screen.getByText(/organization profile edit page/i)).toBeInTheDocument();
  });

  it('renders non-root capacity card correctly', () => {
    const nonRootProps = {
      ...mockProps,
      isRoot: false,
      parentCapacity: {
        code: 2,
        name: 'Parent Capacity',
        color: 'red',
        skill_type: 1,
        skill_wikidata_item: 'skill_wikidata_item',
        icon: 'icon',
        hasChildren: true,
      },
    };

    render(<CapacityCard {...nonRootProps} />);

    expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    const images = screen.getAllByRole('img');
    expect(images.some(img => img.getAttribute('alt') === 'Test Capacity')).toBe(true);
  });
});
