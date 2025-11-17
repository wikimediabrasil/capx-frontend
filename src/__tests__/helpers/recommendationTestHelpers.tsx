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

// Common test utilities
export const testDarkModeRendering = (container: HTMLElement, selector: string) => {
  const element = container.querySelector(selector);
  expect(element).toBeInTheDocument();
};

export const testHintMessageRendering = (screen: any, message: string) => {
  expect(screen.getByText(message)).toBeInTheDocument();
};

// Common afterEach cleanup
export const cleanupMocks = () => {
  jest.clearAllMocks();
};
