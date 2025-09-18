import CapacitySelectionModal from '@/components/CapacitySelectionModal';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { CapacityCacheProvider, useCapacityCache } from '@/contexts/CapacityCacheContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useCapacities } from '@/hooks/useCapacities';
import { capacityService } from '@/services/capacityService';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SessionProvider, useSession } from 'next-auth/react';

// Services and hooks mocks
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/contexts/AppContext', () => ({
  useApp: jest.fn(),
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/hooks/useCapacities', () => ({
  useCapacities: jest.fn(),
  CAPACITY_CACHE_KEYS: {
    root: ['rootCapacities'],
    children: (id: string) => ['childrenCapacities', id],
  },
}));

jest.mock('@/contexts/CapacityCacheContext', () => ({
  useCapacityCache: jest.fn(),
  CapacityCacheProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/services/capacityService', () => ({
  capacityService: {
    fetchCapacities: jest.fn(),
    fetchCapacitiesByType: jest.fn(),
  },
}));

// Test data factory functions
const createMockCapacity = (overrides = {}) => ({
  code: 50,
  name: 'Learning',
  color: 'learning',
  icon: 'book',
  hasChildren: true,
  skill_type: 50,
  skill_wikidata_item: '',
  level: 1,
  description: 'Learning capability',
  ...overrides,
});

const createMockChildCapacity = (overrides = {}) => ({
  code: 501,
  name: 'Active Learning',
  color: 'learning',
  icon: 'book',
  hasChildren: false,
  skill_type: 50,
  skill_wikidata_item: '',
  level: 2,
  description: 'Active learning capability',
  ...overrides,
});

// Test data mocks
const mockCapacities = [
  createMockCapacity(),
  createMockCapacity({
    code: 36,
    name: 'Communication',
    color: 'communication',
    icon: 'message',
    skill_type: 36,
    description: 'Communication capability',
  }),
];

const mockChildCapacities = [createMockChildCapacity()];

// Common test constants
const TIMEOUT_CONFIG = { timeout: 3000 };
const QUICK_TIMEOUT_CONFIG = { timeout: 1000 };

// Query client configuration
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
    },
  });

// Common mock data
const createMockPageContent = () => ({
  'capacity-selection-modal-select-capacity-button-multiple-capacities': 'capacities',
  'capacity-selection-modal-select-capacity-button-multiple-selected': 'selected',
  'capacity-selection-modal-select-capacity-button': 'Select',
  'capacity-selection-modal-select-capacity-button-cancel': 'Cancel',
  'capacity-selection-modal-root-capacities': 'Root capacities',
  'capacity-selection-modal-back': 'Back',
  'capacity-selection-modal-loading': 'Loading...',
  'capacity-selection-modal-no-capacities-found': 'No capacities found',
  'capacity-selection-modal-selected': 'Selected',
  'capacity-selection-modal-select-capacity': 'Capacity',
  'capacity-selection-modal-see-more-information': 'See more information',
  'capacity-selection-modal-hover-view-capacity-feed': 'Click to view it in the Capacity Feed',
});

// Wrapper for the necessary providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <SessionProvider session={null}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppProvider>
            <CapacityCacheProvider>{children}</CapacityCacheProvider>
          </AppProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

describe('CapacitySelectionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSelect = jest.fn();
  const mockQueryClient = {
    invalidateQueries: jest.fn(),
  };

  beforeEach(() => {
    // Setup mocks
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mock-token' } },
    });

    (useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
    });

    (useApp as jest.Mock).mockReturnValue({
      pageContent: createMockPageContent(),
      isMobile: false,
    });

    (useCapacities as jest.Mock).mockReturnValue({
      getCapacityById: jest.fn(),
    });

    (useCapacityCache as jest.Mock).mockReturnValue({
      getCapacity: jest.fn(),
      hasChildren: jest.fn().mockReturnValue(true),
      preloadCapacities: jest.fn(),
    });

    // Mock useQuery with stable data and no side effects
    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'rootCapacities') {
        return {
          data: mockCapacities,
          isLoading: false,
          isFetching: false,
        };
      }
      if (queryKey[0] === 'capacityDescription') {
        return {
          data: {
            id: 50,
            description: 'Learning capability',
            wdCode: 'Q123',
          },
          isLoading: false,
          isFetching: false,
        };
      }
      if (queryKey[0] === 'childrenCapacities' && queryKey[1] === '50') {
        return {
          data: mockChildCapacities,
          isLoading: false,
          isFetching: false,
        };
      }
      return {
        data: [],
        isLoading: false,
        isFetching: false,
      };
    });

    (useQueryClient as jest.Mock).mockReturnValue({
      ...mockQueryClient,
      invalidateQueries: jest.fn().mockResolvedValue(undefined),
    });

    (capacityService.fetchCapacities as jest.Mock).mockResolvedValue(mockCapacities);
    (capacityService.fetchCapacitiesByType as jest.Mock).mockResolvedValue(mockChildCapacities);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper functions for common test actions
  const renderModalWithProviders = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: mockOnClose,
      onSelect: mockOnSelect,
      title: 'Select a Capacity',
      ...props,
    };

    const queryClient = createTestQueryClient();

    return render(<CapacitySelectionModal {...defaultProps} />, {
      wrapper: ({ children }) => (
        <SessionProvider session={null}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AppProvider>
                <CapacityCacheProvider>{children}</CapacityCacheProvider>
              </AppProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SessionProvider>
      ),
    });
  };

  const waitForModalToLoad = async () => {
    await waitFor(() => {
      expect(screen.getByText('Learning')).toBeInTheDocument();
      expect(screen.getByText('Communication')).toBeInTheDocument();
    }, TIMEOUT_CONFIG);
  };

  const clickCapacityCard = (capacityName: string) => {
    const card = screen.getByText(capacityName).closest('div');
    fireEvent.click(card!);
  };

  const clickConfirmButton = () => {
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons[buttons.length - 1];
    fireEvent.click(confirmButton);
  };

  const expandCapacity = async (capacityName: string) => {
    // The component uses pageContent['alt-expand'] || 'Expand to show more details' as aria-label
    const expandButtons = screen.getAllByLabelText('Expand to show more details');
    fireEvent.click(expandButtons[0]);

    // Wait for the children to be loaded and displayed
    await waitFor(
      () => {
        // Check if the child capacity is displayed after expanding
        // This assumes that 'Active Learning' is a child capacity that should be shown after expanding
        expect(screen.getByText('Active Learning')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  };

  const clickInfoButton = () => {
    // The component uses 'Information icon, view additional details' as aria-label
    const infoButtons = screen.getAllByLabelText('Information icon, view additional details');
    fireEvent.click(infoButtons[0]);
  };

  const expectCapacityInfoToBeVisible = async () => {
    await waitFor(() => {
      expect(screen.getByText('Learning capability')).toBeInTheDocument();
    }, TIMEOUT_CONFIG);

    await waitFor(() => {
      const titleElements = screen.getAllByText('Learning');
      expect(titleElements.length).toBeGreaterThanOrEqual(2);
    }, TIMEOUT_CONFIG);
  };

  const expectCheckmarkToBeVisible = async () => {
    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument();
    }, QUICK_TIMEOUT_CONFIG);
  };

  const expectCheckmarkToBeHidden = async () => {
    await waitFor(() => {
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    }, QUICK_TIMEOUT_CONFIG);
  };

  it('should render the modal correctly when open', async () => {
    renderModalWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Select a Capacity')).toBeInTheDocument();
    }, TIMEOUT_CONFIG);

    await waitForModalToLoad();
  });

  it('should not render the modal when closed', () => {
    const { container } = renderModalWithProviders({ isOpen: false });

    // Verify if the modal has the hidden class
    const modal = container.querySelector('.fixed.inset-0');
    expect(modal).toHaveClass('hidden');
  });

  it('should call onClose when the close button is clicked', async () => {
    renderModalWithProviders();

    // Wait for the initial render
    await waitFor(() => {
      expect(screen.getByText('Select a Capacity')).toBeInTheDocument();
    }, TIMEOUT_CONFIG);

    // Click on the close button (the ✕ icon button)
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should expand a capacity when clicked', async () => {
    renderModalWithProviders();

    await waitForModalToLoad();
    await expandCapacity('Learning');
  });

  it('should select a capacity and call onSelect', async () => {
    renderModalWithProviders();

    await waitForModalToLoad();
    await expandCapacity('Learning');

    clickCapacityCard('Active Learning');
    clickConfirmButton();

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          code: 501,
          name: 'Active Learning',
        }),
      ])
    );
  });

  it('should show capacity information when the info icon is clicked', async () => {
    renderModalWithProviders();

    await waitForModalToLoad();
    clickInfoButton();
    await expectCapacityInfoToBeVisible();
  });

  it('should navigate correctly between capacity levels', async () => {
    renderModalWithProviders();

    await waitForModalToLoad();
    await expandCapacity('Learning');
    clickCapacityCard('Active Learning');

    // Verify if the confirm button is enabled
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons[buttons.length - 1];
    expect(confirmButton).not.toBeDisabled();
  });

  it('should update the selected path when navigating between capacities', async () => {
    renderModalWithProviders();

    await waitForModalToLoad();
    await expandCapacity('Learning');

    // Wait for the path to be updated
    await waitFor(() => {
      const pathElement = screen.getByText(content => content.includes('Learning'));
      expect(pathElement).toBeInTheDocument();
    }, TIMEOUT_CONFIG);
  });

  it('should close the modal and clear state when clicking cancel', async () => {
    renderModalWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Select a Capacity')).toBeInTheDocument();
    }, TIMEOUT_CONFIG);

    // Click on the cancel button (the first button of the action buttons)
    const actionButtons = screen.getAllByRole('button');
    const cancelButton = actionButtons[actionButtons.length - 2]; // Second to last button
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  describe('Multiple Selection', () => {
    it('should allow selecting multiple capacities when allowMultipleSelection is true', async () => {
      renderModalWithProviders({
        title: 'Select Capacities',
        allowMultipleSelection: true,
      });

      await waitForModalToLoad();

      clickCapacityCard('Learning');
      clickCapacityCard('Communication');
      clickConfirmButton();

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 50,
            name: 'Learning',
          }),
          expect.objectContaining({
            code: 36,
            name: 'Communication',
          }),
        ])
      );
    });

    it('should show visual indicators for selected capacities', async () => {
      renderModalWithProviders({
        title: 'Select Capacities',
        allowMultipleSelection: true,
      });

      await waitForModalToLoad();
      clickCapacityCard('Learning');
      await expectCheckmarkToBeVisible();
    });

    it('should allow deselecting an already selected capacity', async () => {
      renderModalWithProviders({
        title: 'Select Capacities',
        allowMultipleSelection: true,
      });

      await waitForModalToLoad();

      clickCapacityCard('Learning');
      await expectCheckmarkToBeVisible();

      clickCapacityCard('Learning'); // Click again to deselect
      await expectCheckmarkToBeHidden();
    });

    it('should update button text with the number of selected capacities', async () => {
      renderModalWithProviders({
        title: 'Select Capacities',
        allowMultipleSelection: true,
      });

      await waitForModalToLoad();

      clickCapacityCard('Learning');
      clickCapacityCard('Communication');

      // Verify that the button text shows the count
      await waitFor(() => {
        const buttonText = screen.getByText('2 capacities selected');
        expect(buttonText).toBeInTheDocument();
      }, QUICK_TIMEOUT_CONFIG);
    });
  });

  describe('Single Selection', () => {
    it('should allow selecting only one capacity when allowMultipleSelection is false', async () => {
      renderModalWithProviders({ allowMultipleSelection: false });

      await waitForModalToLoad();

      clickCapacityCard('Learning');
      clickCapacityCard('Communication'); // Should replace the first
      clickConfirmButton();

      // Should only have the last selected capacity
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 36,
            name: 'Communication',
          }),
        ])
      );

      // Should not contain the first capacity
      expect(mockOnSelect).not.toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 50,
            name: 'Learning',
          }),
        ])
      );
    });
  });
});
