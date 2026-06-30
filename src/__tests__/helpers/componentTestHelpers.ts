/**
 * Shared mock factory functions for component tests.
 *
 * IMPORTANT: jest.mock() is hoisted to the top of the file by Jest's babel
 * transform, so ES imports are not available inside jest.mock() factories.
 * Use require() to pull these helpers in at runtime:
 *
 *
 * or with capacityStore:
 *
 *   jest.mock('@/stores', () => {
 *     const { createStoresMock } = require('../helpers/componentTestHelpers');
 *     return createStoresMock({ capacityStore: true });
 *   });
 */

export function createStoresMock(
  options: {
    pageContent?: Record<string, string>;
    darkMode?: boolean;
    isMobile?: boolean;
    language?: string;
    capacityStore?: boolean;
  } = {}
) {
  const {
    pageContent = {},
    darkMode = false,
    isMobile = false,
    language = 'en',
    capacityStore = false,
  } = options;

  const appStoreState = {
    isMobile,
    mobileMenuStatus: false,
    language,
    pageContent,
    session: null,
    mounted: true,
    setMobileMenuStatus: jest.fn(),
    setLanguage: jest.fn(),
    setPageContent: jest.fn(),
    setSession: jest.fn(),
    setIsMobile: jest.fn(),
    hydrate: jest.fn(),
  };

  const themeStoreState = {
    darkMode,
    setDarkMode: jest.fn(),
    mounted: true,
    hydrate: jest.fn(),
  };

  const base: Record<string, any> = {
    ...jest.requireActual('@/stores'),
    useDarkMode: jest.fn(() => darkMode),
    useSetDarkMode: jest.fn(() => jest.fn()),
    useThemeStore: Object.assign(
      jest.fn(() => themeStoreState),
      {
        getState: () => themeStoreState,
      }
    ),
    useIsMobile: jest.fn(() => isMobile),
    usePageContent: jest.fn(() => pageContent),
    useLanguage: jest.fn(() => language),
    useMobileMenuStatus: jest.fn(() => false),
    useAppStore: Object.assign(
      jest.fn(() => appStoreState),
      {
        getState: () => appStoreState,
      }
    ),
  };

  if (capacityStore) {
    const capacityStoreState = {
      capacities: {},
      children: {},
      language,
      timestamp: 0,
      isLoadingTranslations: false,
      isLoaded: false,
      getName: jest.fn((id: number) => `Capacity ${id}`),
      getDescription: jest.fn((id: number) => `Description ${id}`),
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
      updateCapacityTranslation: jest.fn(),
    };
    base.useCapacityStore = Object.assign(
      jest.fn((selector?: any) => (selector ? selector(capacityStoreState) : capacityStoreState)),
      { getState: () => capacityStoreState }
    );
  }

  return base;
}

/**
 * Shared mock factory for jest.mock('next/image').
 * Usage: jest.mock('next/image', () => {
 *   const { nextImageMock } = require('../helpers/componentTestHelpers');
 *   return nextImageMock();
 * });
 */
export function nextImageMock() {
  return {
    __esModule: true,
    default: (props: any) => {
      const { fill, priority, quality, placeholder, blurDataURL, ...imgProps } = props;
      return require('react').createElement('img', imgProps);
    },
  };
}

/**
 * Shared mock factory for jest.mock('next/navigation').
 * Usage: jest.mock('next/navigation', () => {
 *   const { nextNavigationMock } = require('../helpers/componentTestHelpers');
 *   return nextNavigationMock();
 * });
 */
export function nextNavigationMock() {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    })),
    usePathname: jest.fn(() => '/'),
    useSearchParams: jest.fn(() => new URLSearchParams()),
  };
}

/**
 * Factory for capacity store state objects (used in CapacitiesTree/Visualization tests).
 */
export function createCapacityState(overrides: Record<string, any> = {}) {
  return {
    capacities: {},
    isLoaded: true,
    isLoadingTranslations: false,
    language: 'en',
    getName: jest.fn((code: number) => `Capacity ${code}`),
    getDescription: jest.fn(() => 'Description'),
    getWdCode: jest.fn(() => ''),
    getMetabaseCode: jest.fn(() => ''),
    getColor: jest.fn(() => 'organizational'),
    getChildren: jest.fn(() => []),
    getRootCapacities: jest.fn(() => []),
    isFallbackTranslation: jest.fn(() => false),
    ...overrides,
  };
}

/**
 * Creates a mock useCapacityStore implementation backed by createCapacityState.
 */
export function mockCapacityStoreSelector(stateOverrides: Record<string, any> = {}) {
  const state = createCapacityState(stateOverrides);
  return (selector?: any) => (selector ? selector(state) : state);
}
