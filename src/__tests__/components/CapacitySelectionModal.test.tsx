import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useCapacities } from '@/hooks/useCapacities';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CapacitySelectionModal from '@/components/CapacitySelectionModal';
import { capacityService } from '@/services/capacityService';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import { CapacityCacheProvider } from '@/contexts/CapacityCacheContext';
import { SessionProvider } from 'next-auth/react';

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

// Test data mocks
const mockCapacities = [
  {
    code: 50,
    name: 'Learning',
    color: 'learning',
    icon: 'book',
    hasChildren: true,
    skill_type: 50,
    skill_wikidata_item: '',
    level: 1,
    description: 'Learning capability',
  },
  {
    code: 36,
    name: 'Communication',
    color: 'communication',
    icon: 'message',
    hasChildren: true,
    skill_type: 36,
    skill_wikidata_item: '',
    level: 1,
    description: 'Communication capability',
  },
];

const mockChildCapacities = [
  {
    code: 501,
    name: 'Active Learning',
    color: 'learning',
    icon: 'book',
    hasChildren: false,
    skill_type: 50,
    skill_wikidata_item: '',
    level: 2,
    description: 'Active learning capability',
  },
];

// Wrapper for the necessary providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

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
      pageContent: {
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
        'capacity-selection-modal-hover-view-capacity-feed':
          'Click to view it in the Capacity Feed',
      },
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

  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
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

    return render(ui, {
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

  it('should render the modal correctly when open', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Select a Capacity"
      />
    );

    await waitFor(
      () => {
        expect(screen.getByText('Select a Capacity')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
        expect(screen.getByText('Communication')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should not render the modal when closed', () => {
    const { container } = renderWithProviders(
      <CapacitySelectionModal
        isOpen={false}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Select a Capacity"
      />
    );

    // Verify if the modal has the hidden class
    const modal = container.querySelector('.fixed.inset-0');
    expect(modal).toHaveClass('hidden');
  });

  it('should call onClose when the close button is clicked', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Select a Capacity"
      />
    );

    // Wait for the initial render
    await waitFor(
      () => {
        expect(screen.getByText('Select a Capacity')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Click on the close button (the ✕ icon button)
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should expand a capacity when clicked', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Select a Capacity"
      />
    );

    // Wait for the initial render
    await waitFor(
      () => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Click on the expand button of the first capacity
    const expandButtons = screen.getAllByLabelText('Expand');
    fireEvent.click(expandButtons[0]);

    // Wait for the render of the child capacities
    await waitFor(
      () => {
        expect(screen.getByText('Active Learning')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should select a capacity and call onSelect', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Select a Capacity"
      />
    );

    // Wait for the initial render
    await waitFor(
      () => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Click on the expand button of the first capacity
    const expandButtons = screen.getAllByLabelText('Expand');
    fireEvent.click(expandButtons[0]);

    // Wait for the render of the child capacity and click on it
    await waitFor(
      () => {
        const childCapacity = screen.getByText('Active Learning');
        expect(childCapacity).toBeInTheDocument();
        fireEvent.click(childCapacity);
      },
      { timeout: 3000 }
    );

    // Click on the confirm button (the last button)
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons[buttons.length - 1];
    fireEvent.click(confirmButton);

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
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Select a Capacity"
      />
    );

    // Wait for the initial render
    await waitFor(
      () => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Click on the info button of the first capacity
    const infoButtons = screen.getAllByLabelText('Info');
    fireEvent.click(infoButtons[0]);

    // Wait for the description to be displayed
    await waitFor(
      () => {
        expect(screen.getByText('Learning capability')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify that the title is also displayed in the expanded content
    await waitFor(
      () => {
        // The title should appear twice: once in the card header and once in the expanded content
        const titleElements = screen.getAllByText('Learning');
        expect(titleElements.length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 3000 }
    );
  });

  it('should navigate correctly between capacity levels', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Select a Capacity"
      />
    );

    // Wait for the initial render
    await waitFor(
      () => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Click on the expand button of the first capacity
    const expandButtons = screen.getAllByLabelText('Expand');
    fireEvent.click(expandButtons[0]);

    // Wait for the render of the child capacities
    await waitFor(
      () => {
        expect(screen.getByText('Active Learning')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Click on the child capacity
    const childCapacity = screen.getByText('Active Learning');
    fireEvent.click(childCapacity);

    // Verify if the confirm button is enabled
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons[buttons.length - 1];
    expect(confirmButton).not.toBeDisabled();
  });

  it('should update the selected path when navigating between capacities', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Select a Capacity"
      />
    );

    // Wait for the initial render
    await waitFor(
      () => {
        expect(screen.getByText('Learning')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Click on the expand button of the first capacity
    const expandButtons = screen.getAllByLabelText('Expand');
    fireEvent.click(expandButtons[0]);

    // Wait for the path to be updated
    await waitFor(
      () => {
        const pathElement = screen.getByText(content => content.includes('Learning'));
        expect(pathElement).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should close the modal and clear state when clicking cancel', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Select a Capacity"
      />
    );

    // Wait for the initial render
    await waitFor(
      () => {
        expect(screen.getByText('Select a Capacity')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Click on the cancel button (the first button of the action buttons)
    const actionButtons = screen.getAllByRole('button');
    const cancelButton = actionButtons[actionButtons.length - 2]; // Second to last button
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  describe('Multiple Selection', () => {
    it('should allow selecting multiple capacities when allowMultipleSelection is true', async () => {
      renderWithProviders(
        <CapacitySelectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          title="Select Capacities"
          allowMultipleSelection={true}
        />
      );

      // Wait for the initial render
      await waitFor(
        () => {
          expect(screen.getByText('Learning')).toBeInTheDocument();
          expect(screen.getByText('Communication')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Click on the first capacity to select it
      const learningCard = screen.getByText('Learning').closest('div');
      fireEvent.click(learningCard!);

      // Click on the second capacity to select it
      const communicationCard = screen.getByText('Communication').closest('div');
      fireEvent.click(communicationCard!);

      // Click on the confirm button
      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons[buttons.length - 1];
      fireEvent.click(confirmButton);

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
      renderWithProviders(
        <CapacitySelectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          title="Select Capacities"
          allowMultipleSelection={true}
        />
      );

      // Wait for the initial render
      await waitFor(
        () => {
          expect(screen.getByText('Learning')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Click on the first capacity to select it
      const learningCard = screen.getByText('Learning').closest('div');
      fireEvent.click(learningCard!);

      // Verify that the checkmark appears
      await waitFor(
        () => {
          expect(screen.getByText('✓')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should allow deselecting an already selected capacity', async () => {
      renderWithProviders(
        <CapacitySelectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          title="Select Capacities"
          allowMultipleSelection={true}
        />
      );

      // Wait for the initial render
      await waitFor(
        () => {
          expect(screen.getByText('Learning')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Click on the capacity to select it
      const learningCard = screen.getByText('Learning').closest('div');
      fireEvent.click(learningCard!);

      // Verify that the checkmark appears
      await waitFor(
        () => {
          expect(screen.getByText('✓')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Click again to deselect
      fireEvent.click(learningCard!);

      // Verify that the checkmark disappears
      await waitFor(
        () => {
          expect(screen.queryByText('✓')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should update button text with the number of selected capacities', async () => {
      renderWithProviders(
        <CapacitySelectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          title="Select Capacities"
          allowMultipleSelection={true}
        />
      );

      // Wait for the initial render
      await waitFor(
        () => {
          expect(screen.getByText('Learning')).toBeInTheDocument();
          expect(screen.getByText('Communication')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Click on both capacities to select them
      const learningCard = screen.getByText('Learning').closest('div');
      const communicationCard = screen.getByText('Communication').closest('div');

      fireEvent.click(learningCard!);
      fireEvent.click(communicationCard!);

      // Verify that the button text shows the count
      await waitFor(
        () => {
          const buttonText = screen.getByText('2 capacities selected');
          expect(buttonText).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Single Selection', () => {
    it('should allow selecting only one capacity when allowMultipleSelection is false', async () => {
      renderWithProviders(
        <CapacitySelectionModal
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          title="Select a Capacity"
          allowMultipleSelection={false}
        />
      );

      // Wait for the initial render
      await waitFor(
        () => {
          expect(screen.getByText('Learning')).toBeInTheDocument();
          expect(screen.getByText('Communication')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Click on the first capacity
      const learningCard = screen.getByText('Learning').closest('div');
      fireEvent.click(learningCard!);

      // Click on the second capacity (should replace the first)
      const communicationCard = screen.getByText('Communication').closest('div');
      fireEvent.click(communicationCard!);

      // Click on the confirm button
      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons[buttons.length - 1];
      fireEvent.click(confirmButton);

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
