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
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock('@/contexts/AppContext', () => ({
  useApp: jest.fn(),
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock('@/hooks/useCapacities', () => ({
  useCapacities: jest.fn(),
  CAPACITY_CACHE_KEYS: {
    root: ['rootCapacities'],
    children: (id: string) => ['childrenCapacities', id]
  }
}));

jest.mock('@/contexts/CapacityCacheContext', () => ({
  useCapacityCache: jest.fn(),
  CapacityCacheProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock('@/services/capacityService', () => ({
  capacityService: {
    fetchCapacities: jest.fn(),
    fetchCapacitiesByType: jest.fn()
  }
}));

// Test data mocks
const mockCapacities = [
  {
    code: 50,
    name: 'Aprendizagem',
    color: 'learning',
    icon: 'book',
    hasChildren: true,
    skill_type: 50,
    skill_wikidata_item: '',
    level: 1,
    description: 'Capacidade de aprendizado'
  },
  {
    code: 36,
    name: 'Comunicação',
    color: 'communication',
    icon: 'message',
    hasChildren: true,
    skill_type: 36,
    skill_wikidata_item: '',
    level: 1,
    description: 'Capacidade de comunicação'
  }
];

const mockChildCapacities = [
  {
    code: 501,
    name: 'Aprendizagem Ativa',
    color: 'learning',
    icon: 'book',
    hasChildren: false,
    skill_type: 50,
    skill_wikidata_item: '',
    level: 2,
    description: 'Capacidade de aprendizado ativo'
  }
];

// Wrapper for the necessary providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
    },
  });

  return (
    <SessionProvider session={null}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppProvider>
            <CapacityCacheProvider>
              {children}
            </CapacityCacheProvider>
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
    invalidateQueries: jest.fn()
  };

  beforeEach(() => {
    // Setup mocks
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mock-token' } }
    });

    (useTheme as jest.Mock).mockReturnValue({
      darkMode: false
    });

    (useApp as jest.Mock).mockReturnValue({
      pageContent: {},
      isMobile: false
    });

    (useCapacities as jest.Mock).mockReturnValue({
      getCapacityById: jest.fn()
    });

    (useCapacityCache as jest.Mock).mockReturnValue({
      getCapacity: jest.fn(),
      hasChildren: jest.fn().mockReturnValue(true),
      preloadCapacities: jest.fn()
    });

    // Mock useQuery with stable data and no side effects
    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'rootCapacities') {
        return { 
          data: mockCapacities, 
          isLoading: false,
          isFetching: false
        };
      }
      if (queryKey[0] === 'capacityDescription') {
        return {
          data: {
            id: 50,
            description: 'Capacidade de aprendizado',
            wdCode: 'Q123'
          },
          isLoading: false,
          isFetching: false
        };
      }
      if (queryKey[0] === 'childrenCapacities' && queryKey[1] === '50') {
        return { 
          data: mockChildCapacities, 
          isLoading: false,
          isFetching: false
        };
      }
      return { 
        data: [], 
        isLoading: false,
        isFetching: false
      };
    });

    (useQueryClient as jest.Mock).mockReturnValue({
      ...mockQueryClient,
      invalidateQueries: jest.fn().mockResolvedValue(undefined)
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
          cacheTime: 0,
          staleTime: 0,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false
        },
      },
    });

    return render(ui, { 
      wrapper: ({ children }) => (
        <SessionProvider session={null}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AppProvider>
                <CapacityCacheProvider>
                  {children}
                </CapacityCacheProvider>
              </AppProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SessionProvider>
      )
    });
  };

  it('deve renderizar o modal corretamente quando aberto', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Selecione uma Capacidade"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Selecione uma Capacidade')).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText('Aprendizagem')).toBeInTheDocument();
      expect(screen.getByText('Comunicação')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('não deve renderizar o modal quando fechado', () => {
    const { container } = renderWithProviders(
      <CapacitySelectionModal
        isOpen={false}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Selecione uma Capacidade"
      />
    );

    // Verify if the modal has the hidden class
    const modal = container.querySelector('.fixed.inset-0');
    expect(modal).toHaveClass('hidden');
  });

  it('deve chamar onClose quando o botão de fechar for clicado', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Selecione uma Capacidade"
      />
    );

    // Wait for the initial render
    await waitFor(() => {
      expect(screen.getByText('Selecione uma Capacidade')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click on the close button (the ✕ icon button)
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deve expandir uma capacidade quando clicada', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Selecione uma Capacidade"
      />
    );

    // Wait for the initial render
    await waitFor(() => {
      expect(screen.getByText('Aprendizagem')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click on the expand button of the first capacity
    const expandButtons = screen.getAllByLabelText('Expand');
    fireEvent.click(expandButtons[0]);

    // Wait for the render of the child capacities
    await waitFor(() => {
      expect(screen.getByText('Aprendizagem Ativa')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve selecionar uma capacidade e chamar onSelect', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Selecione uma Capacidade"
      />
    );

    // Wait for the initial render
    await waitFor(() => {
      expect(screen.getByText('Aprendizagem')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click on the expand button of the first capacity
    const expandButtons = screen.getAllByLabelText('Expand');
    fireEvent.click(expandButtons[0]);

    // Wait for the render of the child capacity and click on it
    await waitFor(() => {
      const childCapacity = screen.getByText('Aprendizagem Ativa');
      expect(childCapacity).toBeInTheDocument();
      fireEvent.click(childCapacity);
    }, { timeout: 3000 });

    // Click on the confirm button (the last button)
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons[buttons.length - 1];
    fireEvent.click(confirmButton);

    expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining({
      code: 501,
      name: 'Aprendizagem Ativa'
    }));
  });

  it('deve mostrar informações da capacidade quando o ícone de info for clicado', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Selecione uma Capacidade"
      />
    );

    // Wait for the initial render
    await waitFor(() => {
      expect(screen.getByText('Aprendizagem')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click on the info button of the first capacity
    const infoButtons = screen.getAllByLabelText('Info');
    fireEvent.click(infoButtons[0]);

    // Wait for the description to be displayed
    await waitFor(() => {
      expect(screen.getByText('Capacidade de aprendizado')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve navegar corretamente entre os níveis de capacidade', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Selecione uma Capacidade"
      />
    );

    // Wait for the initial render
    await waitFor(() => {
      expect(screen.getByText('Aprendizagem')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click on the expand button of the first capacity
    const expandButtons = screen.getAllByLabelText('Expand');
    fireEvent.click(expandButtons[0]);

    // Wait for the render of the child capacities
    await waitFor(() => {
      expect(screen.getByText('Aprendizagem Ativa')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click on the child capacity
    const childCapacity = screen.getByText('Aprendizagem Ativa');
    fireEvent.click(childCapacity);

    // Verify if the confirm button is enabled
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons[buttons.length - 1];
    expect(confirmButton).not.toBeDisabled();
  });

  it('deve atualizar o caminho selecionado ao navegar entre capacidades', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Selecione uma Capacidade"
      />
    );

    // Wait for the initial render
    await waitFor(() => {
      expect(screen.getByText('Aprendizagem')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click on the expand button of the first capacity
    const expandButtons = screen.getAllByLabelText('Expand');
    fireEvent.click(expandButtons[0]);

    // Wait for the path to be updated
    await waitFor(() => {
      const pathElement = screen.getByText((content) => content.includes('Aprendizagem'));
      expect(pathElement).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve fechar o modal e limpar o estado ao clicar em cancelar', async () => {
    renderWithProviders(
      <CapacitySelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        title="Selecione uma Capacidade"
      />
    );

    // Wait for the initial render
    await waitFor(() => {
      expect(screen.getByText('Selecione uma Capacidade')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click on the cancel button (the first button of the action buttons)
    const actionButtons = screen.getAllByRole('button');
    const cancelButton = actionButtons[actionButtons.length - 2]; // Penúltimo botão
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
}); 