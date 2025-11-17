import { render } from '@testing-library/react';

// Common test wrapper component
export const createTestWrapper = (additionalProviders?: Array<React.ComponentType<{ children: React.ReactNode }>>) => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    let wrappedChildren = children;

    // Wrap with additional providers (from innermost to outermost)
    if (additionalProviders) {
      // Reverse to apply providers in correct order
      [...additionalProviders].reverse().forEach(Provider => {
        wrappedChildren = <Provider>{wrappedChildren}</Provider>;
      });
    }

    return <>{wrappedChildren}</>;
  };

  return TestWrapper;
};

// Common mock functions
export const createMockPageContent = (overrides = {}) => ({
  'view-profile': 'View Profile',
  'save': 'Save',
  'saved-profiles-delete-success': 'Profile removed from saved',
  'saved-profiles-add-success': 'Profile saved successfully',
  'saved-profiles-error': 'Error saving profile',
  'profile-picture': 'Profile picture',
  'organization-logo': 'Organization logo',
  'add-to-profile': 'Add to Profile',
  'added': 'Added',
  'view': 'View',
  'loading': 'Loading...',
  'capacity-added-success': 'Capacity added to profile',
  'error': 'Error adding capacity',
  'capacity-icon': 'Capacity icon',
  'select-capacity': 'Select Capacity',
  'recommendations-based-on-profile': 'Based on your profile',
  ...overrides,
});

// Common mock setup helpers
export const setupCommonMocks = (
  useSession: jest.Mock,
  useTheme: jest.Mock,
  useApp: jest.Mock,
  pageContentOverrides = {}
) => {
  useSession.mockReturnValue({
    data: { user: { token: 'mock-token', id: '123' } },
  });

  useTheme.mockReturnValue({
    darkMode: false,
  });

  useApp.mockReturnValue({
    pageContent: createMockPageContent(pageContentOverrides),
    language: 'en',
  });
};

// Helper to render with common providers
export const renderWithProviders = (
  ui: React.ReactElement,
  additionalProviders?: React.ComponentType<any>[]
) => {
  const Wrapper = createTestWrapper(additionalProviders);
  return render(ui, { wrapper: Wrapper });
};


// Common afterEach cleanup
export const cleanupMocks = () => {
  jest.clearAllMocks();
};

// Mock factory for CapacityCache
export const createMockCapacityCache = (overrides = {}) => ({
  getName: jest.fn((id) => {
    if (id === 50) return 'Learning';
    return `Capacity ${id}`;
  }),
  getIcon: jest.fn(() => '/icons/book.svg'),
  getColor: jest.fn(() => 'learning'),
  getDescription: jest.fn((id) => {
    if (id === 50) return 'Learning capability';
    return `Description for ${id}`;
  }),
  preloadCapacities: jest.fn().mockResolvedValue(undefined),
  getCapacity: jest.fn(),
  getRootCapacities: jest.fn(() => []),
  getChildren: jest.fn(() => []),
  hasChildren: jest.fn(() => false),
  getMetabaseCode: jest.fn(code => `M${code}`),
  getWdCode: jest.fn(code => `Q${code}`),
  isLoadingTranslations: false,
  updateLanguage: jest.fn().mockResolvedValue(undefined),
  isFallbackTranslation: jest.fn(() => false),
  ...overrides,
});

// Mock factory for Router
export const createMockRouter = (overrides = {}) => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  ...overrides,
});

// Mock factory for QueryClient
export const createMockQueryClient = () => ({
  setQueryData: jest.fn(),
  invalidateQueries: jest.fn(),
});

// Mock factory for Snackbar
export const createMockSnackbar = () => ({
  showSnackbar: jest.fn(),
});

// Mock factory for SavedItems
export const createMockSavedItems = (savedItems = []) => ({
  savedItems,
  createSavedItem: jest.fn(),
  deleteSavedItem: jest.fn(),
});

// Mock factory for Avatars
export const createMockAvatars = (avatars = []) => ({
  avatars,
});

// Test assertion helpers
export const expectTextInDocument = (screen: any, text: string) => {
  expect(screen.getByText(text)).toBeInTheDocument();
};

export const expectTextNotInDocument = (screen: any, text: string) => {
  expect(screen.queryByText(text)).not.toBeInTheDocument();
};

export const expectElementWithSelector = (container: HTMLElement, selector: string) => {
  const element = container.querySelector(selector);
  expect(element).toBeInTheDocument();
  return element;
};

// Mock for scroll methods (common in carousel tests)
export const mockScrollMethods = () => {
  Element.prototype.scrollBy = jest.fn();
  Element.prototype.scrollTo = jest.fn();
};

// Setup scrollable container state
export const setupScrollableContainer = (
  container: HTMLElement,
  scrollLeft: number,
  scrollWidth: number,
  clientWidth: number
) => {
  const scrollContainer = container.querySelector('[class*="overflow-x-auto"]');
  if (scrollContainer) {
    Object.defineProperty(scrollContainer, 'scrollLeft', {
      writable: true,
      value: scrollLeft,
    });
    Object.defineProperty(scrollContainer, 'scrollWidth', {
      writable: true,
      value: scrollWidth,
    });
    Object.defineProperty(scrollContainer, 'clientWidth', {
      writable: true,
      value: clientWidth,
    });
    return scrollContainer;
  }
  return null;
};

