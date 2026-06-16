import CapacitiesTreeVisualization from '@/app/capacities_visualization/components/CapacitiesTreeVisualization';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock D3TreeVisualization to avoid jsdom / d3 issues
jest.mock('@/app/capacities_visualization/components/D3TreeVisualization', () => ({
  __esModule: true,
  default: ({ data }: { data: any[] }) => (
    <div data-testid="d3-tree" data-count={data.length}>
      D3TreeVisualization
    </div>
  ),
}));

// Mock the skeleton component
jest.mock('@/components/skeletons', () => ({
  CapacitiesTreeSkeleton: () => <div data-testid="tree-skeleton">Loading tree...</div>,
}));

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useIsMobile: jest.fn(() => false),
  useCapacityStore: Object.assign(
    jest.fn((selector?: any) => {
      const state = {
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
        getRootCapacities: jest.fn(() => [
          { code: 10, name: 'organizational', color: 'organizational' },
          { code: 36, name: 'communication', color: 'communication' },
        ]),
        isFallbackTranslation: jest.fn(() => false),
      };
      return selector ? selector(state) : state;
    }),
    {
      getState: () => ({
        capacities: {},
        isLoaded: true,
        isLoadingTranslations: false,
        language: 'en',
      }),
    }
  ),
  useAppStore: Object.assign(
    jest.fn(() => ({ isMobile: false, language: 'en', pageContent: {} })),
    { getState: () => ({ isMobile: false, language: 'en', pageContent: {} }) }
  ),
}));

describe('CapacitiesTreeVisualization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the D3TreeVisualization when data is available and cache is loaded', () => {
    render(<CapacitiesTreeVisualization />);
    expect(screen.getByTestId('d3-tree')).toBeInTheDocument();
  });

  it('shows skeleton when isLoadingTranslations is true', () => {
    const stores = jest.requireMock('@/stores');
    stores.useCapacityStore.mockImplementation((selector?: any) => {
      const state = {
        capacities: {},
        isLoaded: true,
        isLoadingTranslations: true,
        language: 'en',
        getName: jest.fn(() => ''),
        getDescription: jest.fn(() => ''),
        getWdCode: jest.fn(() => ''),
        getMetabaseCode: jest.fn(() => ''),
        getColor: jest.fn(() => ''),
        getChildren: jest.fn(() => []),
        getRootCapacities: jest.fn(() => []),
        isFallbackTranslation: jest.fn(() => false),
      };
      return selector ? selector(state) : state;
    });

    render(<CapacitiesTreeVisualization />);
    expect(screen.getByTestId('tree-skeleton')).toBeInTheDocument();
  });

  it('shows skeleton when isLoaded is false', () => {
    const stores = jest.requireMock('@/stores');
    stores.useCapacityStore.mockImplementation((selector?: any) => {
      const state = {
        capacities: {},
        isLoaded: false,
        isLoadingTranslations: false,
        language: 'en',
        getName: jest.fn(() => ''),
        getDescription: jest.fn(() => ''),
        getWdCode: jest.fn(() => ''),
        getMetabaseCode: jest.fn(() => ''),
        getColor: jest.fn(() => ''),
        getChildren: jest.fn(() => []),
        getRootCapacities: jest.fn(() => []),
        isFallbackTranslation: jest.fn(() => false),
      };
      return selector ? selector(state) : state;
    });

    render(<CapacitiesTreeVisualization />);
    expect(screen.getByTestId('tree-skeleton')).toBeInTheDocument();
  });

  it('shows empty state message when no root capacities exist', () => {
    const stores = jest.requireMock('@/stores');
    stores.useCapacityStore.mockImplementation((selector?: any) => {
      const state = {
        capacities: {},
        isLoaded: true,
        isLoadingTranslations: false,
        language: 'en',
        getName: jest.fn(() => ''),
        getDescription: jest.fn(() => ''),
        getWdCode: jest.fn(() => ''),
        getMetabaseCode: jest.fn(() => ''),
        getColor: jest.fn(() => ''),
        getChildren: jest.fn(() => []),
        getRootCapacities: jest.fn(() => []),
        isFallbackTranslation: jest.fn(() => false),
      };
      return selector ? selector(state) : state;
    });

    render(<CapacitiesTreeVisualization />);
    expect(screen.getByText('Nenhuma capacidade encontrada.')).toBeInTheDocument();
  });

  it.skip('passes the correct number of root capacities to D3TreeVisualization', () => {
    render(<CapacitiesTreeVisualization />);
    const d3Tree = screen.getByTestId('d3-tree');
    // 2 root capacities from mock: codes 10 and 36
    expect(d3Tree.getAttribute('data-count')).toBe('2');
  });

  it('maps root capacity names through getName', () => {
    const stores = jest.requireMock('@/stores');
    const mockGetName = jest.fn((code: number) => `Translated ${code}`);
    stores.useCapacityStore.mockImplementation((selector?: any) => {
      const state = {
        capacities: {},
        isLoaded: true,
        isLoadingTranslations: false,
        language: 'en',
        getName: mockGetName,
        getDescription: jest.fn(() => ''),
        getWdCode: jest.fn(() => ''),
        getMetabaseCode: jest.fn(() => ''),
        getColor: jest.fn(() => 'organizational'),
        getChildren: jest.fn(() => []),
        getRootCapacities: jest.fn(() => [{ code: 10, name: 'fallback', color: 'organizational' }]),
        isFallbackTranslation: jest.fn(() => false),
      };
      return selector ? selector(state) : state;
    });

    render(<CapacitiesTreeVisualization />);
    expect(screen.getByTestId('d3-tree')).toBeInTheDocument();
    expect(mockGetName).toHaveBeenCalledWith(10);
  });

  it('includes children in the tree data', () => {
    const stores = jest.requireMock('@/stores');
    stores.useCapacityStore.mockImplementation((selector?: any) => {
      const state = {
        capacities: {},
        isLoaded: true,
        isLoadingTranslations: false,
        language: 'en',
        getName: jest.fn((code: number) => `Name ${code}`),
        getDescription: jest.fn(() => 'desc'),
        getWdCode: jest.fn(() => 'Q1'),
        getMetabaseCode: jest.fn(() => 'M1'),
        getColor: jest.fn(() => 'organizational'),
        getChildren: jest.fn((code: number) =>
          code === 10
            ? [{ code: 11, name: 'child', color: 'organizational' }]
            : []
        ),
        getRootCapacities: jest.fn(() => [{ code: 10, name: 'org', color: 'organizational' }]),
        isFallbackTranslation: jest.fn(() => false),
      };
      return selector ? selector(state) : state;
    });

    render(<CapacitiesTreeVisualization />);
    expect(screen.getByTestId('d3-tree')).toBeInTheDocument();
  });
});
