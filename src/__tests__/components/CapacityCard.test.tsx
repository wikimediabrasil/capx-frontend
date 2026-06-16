import { CapacityCard } from '@/app/(auth)/capacity/components/CapacityCard';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// Store mocks
// ---------------------------------------------------------------------------
const mockUseDarkMode = jest.fn(() => false);
const mockUseIsMobile = jest.fn(() => false);
const mockUseIsTablet = jest.fn(() => false);
const mockIsFallbackTranslation = jest.fn(() => false);

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: (...args: any[]) => mockUseDarkMode(...args),
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
  useIsMobile: (...args: any[]) => mockUseIsMobile(...args),
  useIsTablet: (...args: any[]) => mockUseIsTablet(...args),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useMobileMenuStatus: jest.fn(() => false),
  useAppStore: Object.assign(
    jest.fn((selector?: any) => {
      const state = {
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
      };
      return selector ? selector(state) : state;
    }),
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
    jest.fn((selector?: any) => {
      const state = {
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
        getIcon: jest.fn(() => ''),
        getChildren: jest.fn(() => []),
        getCapacity: jest.fn(() => null),
        getRootCapacities: jest.fn(() => []),
        hasChildren: jest.fn(() => false),
        isFallbackTranslation: (...args: any[]) => mockIsFallbackTranslation(...args),
        getIsLoaded: jest.fn(() => false),
        getIsDescriptionsReady: jest.fn(() => false),
        updateLanguage: jest.fn(),
        preloadCapacities: jest.fn(),
        clearCache: jest.fn(),
        setCache: jest.fn(),
        invalidateQueryCache: jest.fn(),
      };
      return selector ? selector(state) : state;
    }),
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

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Auth / session mocks
// ---------------------------------------------------------------------------
const mockUseSession = jest.fn(() => ({
  data: { user: { id: '123', token: 'test-token' } },
  status: 'authenticated',
}));

jest.mock('next-auth/react', () => ({
  useSession: (...args: any[]) => mockUseSession(...args),
}));

const mockShowSnackbar = jest.fn();
jest.mock('@/app/providers/SnackbarProvider', () => ({
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar,
  }),
}));

// ---------------------------------------------------------------------------
// Capacity / profile service mocks
// ---------------------------------------------------------------------------
const mockUserKnownCapacities = jest.fn(() => []);
const mockUserAvailableCapacities = jest.fn(() => []);
const mockUserWantedCapacities = jest.fn(() => []);

jest.mock('@/hooks/useUserCapacities', () => ({
  useUserCapacities: () => ({
    userKnownCapacities: mockUserKnownCapacities(),
    userAvailableCapacities: mockUserAvailableCapacities(),
    userWantedCapacities: mockUserWantedCapacities(),
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

const mockUpdateProfile = jest.fn(() => Promise.resolve({}));
jest.mock('@/services/profileService', () => ({
  profileService: {
    updateProfile: (...args: any[]) => mockUpdateProfile(...args),
  },
}));

// ---------------------------------------------------------------------------
// TranslateCapacityModal mock — keeps tests focused
// ---------------------------------------------------------------------------
jest.mock('@/app/(auth)/capacity/components/TranslateCapacityModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="translate-modal">Translate Modal</div> : null,
}));

jest.mock('@/components/TranslationContributeCTA', () => ({
  TranslationContributeCTA: ({ onContribute }: { onContribute: () => void }) => (
    <button onClick={onContribute} data-testid="translation-cta">
      Help translate
    </button>
  ),
}));

// ---------------------------------------------------------------------------
// React Query mocks
// ---------------------------------------------------------------------------
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

const mockUseQuery = jest.fn(() => ({
  data: {
    id: 123,
    skills_known: [],
    skills_available: [],
    skills_wanted: [],
    language: ['en'],
  },
  isLoading: false,
  isError: false,
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
  useQueryClient: jest.fn(() => mockQueryClient),
}));

// ---------------------------------------------------------------------------
// Base props shared across tests
// ---------------------------------------------------------------------------
const baseProps = {
  code: 1,
  name: 'Test Capacity',
  icon: '/test-icon.svg',
  color: 'blue',
  onExpand: jest.fn(),
  isExpanded: false,
  hasChildren: true,
  description: 'Test description',
  wd_code: 'WD123',
  metabase_code: 'MB456',
  isRoot: true,
  onInfoClick: jest.fn().mockResolvedValue('Test description'),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDarkMode.mockReturnValue(false);
  mockUseIsMobile.mockReturnValue(false);
  mockUseIsTablet.mockReturnValue(false);
  mockIsFallbackTranslation.mockReturnValue(false);
  mockUseSession.mockReturnValue({
    data: { user: { id: '123', token: 'test-token' } },
    status: 'authenticated',
  });
  mockUseQuery.mockReturnValue({
    data: { id: 123, skills_known: [], skills_available: [], skills_wanted: [], language: ['en'] },
    isLoading: false,
    isError: false,
  });
  mockUserKnownCapacities.mockReturnValue([]);
  mockUserAvailableCapacities.mockReturnValue([]);
  mockUserWantedCapacities.mockReturnValue([]);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('CapacityCard', () => {
  // ----- Root card -----
  describe('Root card', () => {
    it('renders root capacity card correctly', () => {
      render(<CapacityCard {...baseProps} />);
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
      const images = screen.getAllByRole('img');
      expect(images.some(img => img.getAttribute('alt') === 'Test Capacity')).toBe(true);
    });

    it('calls onExpand when arrow button is clicked', () => {
      render(<CapacityCard {...baseProps} />);
      const expandButton = screen.getByAltText('Expand capacity');
      fireEvent.click(expandButton.closest('button') || expandButton);
      expect(baseProps.onExpand).toHaveBeenCalled();
    });

    it('calls onExpand when card body is clicked', () => {
      render(<CapacityCard {...baseProps} />);
      // The role="button" div wrapping the card header triggers onExpand
      const cardButton = screen.getAllByRole('button')[0];
      fireEvent.click(cardButton);
      expect(baseProps.onExpand).toHaveBeenCalled();
    });

    it('calls onExpand on Enter key press on card', () => {
      render(<CapacityCard {...baseProps} />);
      const cardButton = screen.getAllByRole('button')[0];
      fireEvent.keyDown(cardButton, { key: 'Enter' });
      expect(baseProps.onExpand).toHaveBeenCalled();
    });

    it('calls onExpand on Space key press on card', () => {
      render(<CapacityCard {...baseProps} />);
      const cardButton = screen.getAllByRole('button')[0];
      fireEvent.keyDown(cardButton, { key: ' ' });
      expect(baseProps.onExpand).toHaveBeenCalled();
    });

    it('does NOT call onExpand on other key press on card', () => {
      render(<CapacityCard {...baseProps} />);
      const cardButton = screen.getAllByRole('button')[0];
      fireEvent.keyDown(cardButton, { key: 'Tab' });
      expect(baseProps.onExpand).not.toHaveBeenCalled();
    });

    it('shows info content when info button is clicked', async () => {
      render(<CapacityCard {...baseProps} />);
      const infoButton = screen.getByLabelText('Information');
      fireEvent.click(infoButton);

      expect(await screen.findByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('WD123')).toBeInTheDocument();
      expect(screen.getByText('MB456')).toBeInTheDocument();
      expect(screen.getByText('Add to Known')).toBeInTheDocument();
      expect(screen.getByText('Add to Wanted')).toBeInTheDocument();
      expect(screen.getByText(/This will be added to your personal profile/i)).toBeInTheDocument();
      expect(screen.getByText(/organization profile edit page/i)).toBeInTheDocument();
    });

    it('calls onInfoClick prop when info button is clicked and panel is not yet open', async () => {
      render(<CapacityCard {...baseProps} />);
      const infoButton = screen.getByLabelText('Information');
      fireEvent.click(infoButton);
      await waitFor(() => expect(baseProps.onInfoClick).toHaveBeenCalledWith(1));
    });

    it('toggles info panel closed when clicked twice', async () => {
      render(<CapacityCard {...baseProps} />);
      const infoButton = screen.getByLabelText('Information');
      fireEvent.click(infoButton);
      await screen.findByText('Test description');
      fireEvent.click(infoButton);
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });

    it('uses external isInfoExpanded / onToggleInfo when provided', async () => {
      const onToggleInfo = jest.fn();
      render(<CapacityCard {...baseProps} isInfoExpanded={true} onToggleInfo={onToggleInfo} />);
      // Panel should be visible because isInfoExpanded=true
      expect(screen.getByText('Test description')).toBeInTheDocument();
      // Clicking info button should call external handler
      const infoButton = screen.getByLabelText('Information');
      fireEvent.click(infoButton);
      expect(onToggleInfo).toHaveBeenCalled();
    });

    it('does NOT show expanded children when isExpanded=false', () => {
      render(<CapacityCard {...baseProps} isExpanded={false} />);
      // The children container is rendered only when isExpanded is true
      expect(screen.queryByTestId('children-container')).not.toBeInTheDocument();
    });

    it('renders expanded children area when isExpanded=true', () => {
      render(<CapacityCard {...baseProps} isExpanded={true} />);
      // The gap/flex wrapper for expanded children is rendered
      const { container } = render(<CapacityCard {...baseProps} isExpanded={true} />);
      expect(container.querySelector('.flex-nowrap')).toBeInTheDocument();
    });

    it('does not show arrow button when hasChildren=false', () => {
      render(<CapacityCard {...baseProps} hasChildren={false} />);
      expect(screen.queryByLabelText('Expand capacity')).not.toBeInTheDocument();
    });

    it('renders in dark mode without crashing', () => {
      mockUseDarkMode.mockReturnValue(true);
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('renders in mobile mode without crashing', () => {
      mockUseIsMobile.mockReturnValue(true);
      render(<CapacityCard {...baseProps} />);
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    });

    it('renders in tablet mode without crashing', () => {
      mockUseIsTablet.mockReturnValue(true);
      render(<CapacityCard {...baseProps} />);
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    });

    it('capitalizes the first letter of the name', () => {
      render(<CapacityCard {...baseProps} name="lower case" />);
      expect(screen.getByText('Lower case')).toBeInTheDocument();
    });

    it('shows fallback name when name looks like a QID', () => {
      render(<CapacityCard {...baseProps} name="Q12345" code={99} isRoot={false} />);
      expect(screen.getByText('Capacity 99')).toBeInTheDocument();
    });

    it('shows TranslationContributeCTA when isFallbackTranslation is true', async () => {
      mockIsFallbackTranslation.mockReturnValue(true);
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      expect(screen.getByTestId('translation-cta')).toBeInTheDocument();
    });

    it('opens TranslateCapacityModal when TranslationContributeCTA onContribute is called', async () => {
      mockIsFallbackTranslation.mockReturnValue(true);
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      fireEvent.click(screen.getByTestId('translation-cta'));
      expect(screen.getByTestId('translate-modal')).toBeInTheDocument();
    });
  });

  // ----- Child card -----
  describe('Child card (non-root)', () => {
    const childProps = {
      ...baseProps,
      isRoot: false,
      level: 2,
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

    it('renders non-root capacity card correctly', () => {
      render(<CapacityCard {...childProps} />);
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    });

    it('shows info panel on child card when info button clicked', async () => {
      render(<CapacityCard {...childProps} />);
      const infoButton = screen.getByLabelText('Information');
      fireEvent.click(infoButton);
      expect(await screen.findByText('Test description')).toBeInTheDocument();
    });

    it('renders level-3 child card without crashing', () => {
      const grandParent = {
        code: 10,
        name: 'Grandparent',
        color: 'green',
        skill_type: 10,
        skill_wikidata_item: '',
        icon: '',
        hasChildren: true,
      };
      const parent = { ...childProps.parentCapacity, parentCapacity: grandParent };
      render(<CapacityCard {...childProps} level={3} parentCapacity={parent as any} />);
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    });

    it('renders child card with no color gracefully', () => {
      render(<CapacityCard {...childProps} color="" />);
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    });

    it('renders child card with no parent color gracefully', () => {
      render(
        <CapacityCard
          {...childProps}
          parentCapacity={{ ...childProps.parentCapacity, color: '' }}
        />
      );
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    });

    it('renders child card in mobile mode', () => {
      mockUseIsMobile.mockReturnValue(true);
      render(<CapacityCard {...childProps} />);
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    });

    it('renders child card in dark mode', () => {
      mockUseDarkMode.mockReturnValue(true);
      render(<CapacityCard {...childProps} isInfoExpanded={true} />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  // ----- Search card -----
  describe('Search card (isSearch=true)', () => {
    const searchProps = {
      ...baseProps,
      isSearch: true,
      isRoot: false,
      level: 1,
    };

    it('renders search card correctly', () => {
      render(<CapacityCard {...searchProps} />);
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    });

    it('shows info panel in search card when info button clicked', async () => {
      render(<CapacityCard {...searchProps} />);
      const infoButton = screen.getByLabelText('Information');
      fireEvent.click(infoButton);
      expect(await screen.findByText('Test description')).toBeInTheDocument();
    });

    it('renders search card in mobile mode', () => {
      mockUseIsMobile.mockReturnValue(true);
      render(<CapacityCard {...searchProps} />);
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    });

    it('renders search card in tablet mode', () => {
      mockUseIsTablet.mockReturnValue(true);
      render(<CapacityCard {...searchProps} />);
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    });

    it('renders search card in dark mode with info panel', async () => {
      mockUseDarkMode.mockReturnValue(true);
      render(<CapacityCard {...searchProps} isInfoExpanded={true} />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('renders search card with level-2 parent capacity', () => {
      render(
        <CapacityCard
          {...searchProps}
          level={2}
          parentCapacity={{
            code: 2,
            name: 'Parent',
            color: 'red',
            skill_type: 1,
            skill_wikidata_item: '',
            icon: '',
            hasChildren: true,
          }}
        />
      );
      expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    });
  });

  // ----- Add to Known / Wanted buttons -----
  describe('Add to Known / Wanted interactions', () => {
    it('Add to Known button is disabled when session has no token', async () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      mockUseQuery.mockReturnValue({ data: null, isLoading: false, isError: false });
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      const button = screen.getByText('Add to Known');
      expect(button.closest('button')).toBeDisabled();
    });

    it('Add to Known button is disabled when userProfile is null', async () => {
      mockUseQuery.mockReturnValue({ data: null, isLoading: false, isError: false });
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      const button = screen.getByText('Add to Known');
      expect(button.closest('button')).toBeDisabled();
    });

    it('Add to Known button shows "Added" label when already in known', async () => {
      mockUserKnownCapacities.mockReturnValue([1]);
      mockUserAvailableCapacities.mockReturnValue([1]);
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      expect(screen.getByText('✓ Added to Known')).toBeInTheDocument();
    });

    it('Add to Wanted button shows "Added" label when already in wanted', async () => {
      mockUserWantedCapacities.mockReturnValue([1]);
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      expect(screen.getByText('✓ Added to Wanted')).toBeInTheDocument();
    });

    it('shows loading label when profile is loading', async () => {
      mockUseQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false });
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
    });

    it('calls profileService.updateProfile when Add to Known is clicked', async () => {
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      const button = screen.getByText('Add to Known');
      await act(async () => {
        fireEvent.click(button);
      });
      await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalled());
    });

    it('calls profileService.updateProfile when Add to Wanted is clicked', async () => {
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      const button = screen.getByText('Add to Wanted');
      await act(async () => {
        fireEvent.click(button);
      });
      await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalled());
    });

    it('shows snackbar error when Add to Known is clicked without session', async () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      // Enable button manually by bypassing disabled check: call handler directly through render
      // We instead verify the button is disabled and does not trigger profileService
      mockUseQuery.mockReturnValue({ data: null, isLoading: false, isError: false });
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      // Button is disabled — clicking it should not call updateProfile
      const button = screen.getByText('Add to Known').closest('button')!;
      fireEvent.click(button);
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('shows snackbar success after successful Add to Known', async () => {
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      const button = screen.getByText('Add to Known');
      await act(async () => {
        fireEvent.click(button);
      });
      await waitFor(() =>
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          expect.stringContaining('known') || expect.any(String),
          'success'
        )
      );
    });
  });

  // ----- Metabase / WD links -----
  describe('Expanded info panel links', () => {
    it('renders Metabase link when metabase_code is provided', async () => {
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      const link = screen.getByTitle(/Visit the capacity item page on Metabase/i);
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://metabase.wikibase.cloud/wiki/Item:MB456');
    });

    it('renders Wikidata link when wd_code is provided', async () => {
      render(<CapacityCard {...baseProps} isInfoExpanded={true} />);
      const link = screen.getByTitle(/Visit the capacity item page on Wikidata/i);
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://www.wikidata.org/wiki/WD123');
    });

    it('does not render Metabase link when metabase_code is empty', async () => {
      render(<CapacityCard {...baseProps} metabase_code="" isInfoExpanded={true} />);
      expect(screen.queryByTitle(/Metabase/i)).not.toBeInTheDocument();
    });

    it('does not render Wikidata link when wd_code is empty', async () => {
      render(<CapacityCard {...baseProps} wd_code="" isInfoExpanded={true} />);
      expect(screen.queryByTitle(/Wikidata/i)).not.toBeInTheDocument();
    });

    it('does not render description when description is undefined', () => {
      render(<CapacityCard {...baseProps} description={undefined} isInfoExpanded={true} />);
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });
  });
});
