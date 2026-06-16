import CapacitiesTreeVisualization from '@/app/capacities_visualization/components/CapacitiesTreeVisualization';
import { render, screen } from '@testing-library/react';
import React from 'react';

jest.mock('@/app/capacities_visualization/components/D3TreeVisualization', () => ({
  __esModule: true,
  default: ({ data }: { data: any[] }) => (
    <div data-testid="d3-tree" data-count={data.length}>
      D3TreeVisualization
    </div>
  ),
}));

jest.mock('@/components/skeletons', () => ({
  CapacitiesTreeSkeleton: () => <div data-testid="tree-skeleton">Loading tree...</div>,
}));

jest.mock('@/stores', () => {
  const { createStoresMock, createCapacityState } = require('../helpers/componentTestHelpers');
  const base = createStoresMock();
  const defaultState = createCapacityState({
    getRootCapacities: jest.fn(() => [
      { code: 10, name: 'organizational', color: 'organizational' },
      { code: 36, name: 'communication', color: 'communication' },
    ]),
  });
  base.useCapacityStore = Object.assign(
    jest.fn((selector?: any) => (selector ? selector(defaultState) : defaultState)),
    {
      getState: () => ({
        capacities: {},
        isLoaded: true,
        isLoadingTranslations: false,
        language: 'en',
      }),
    }
  );
  return base;
});

function mockStoreState(overrides: Record<string, any> = {}) {
  const { createCapacityState } = require('../helpers/componentTestHelpers');
  const stores = jest.requireMock('@/stores');
  const state = createCapacityState(overrides);
  stores.useCapacityStore.mockImplementation((selector?: any) =>
    selector ? selector(state) : state
  );
}

describe('CapacitiesTreeVisualization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState({
      getRootCapacities: jest.fn(() => [
        { code: 10, name: 'organizational', color: 'organizational' },
        { code: 36, name: 'communication', color: 'communication' },
      ]),
    });
  });

  it('renders the D3TreeVisualization when data is available and cache is loaded', () => {
    render(<CapacitiesTreeVisualization />);
    expect(screen.getByTestId('d3-tree')).toBeInTheDocument();
  });

  it('shows skeleton when isLoadingTranslations is true', () => {
    mockStoreState({ isLoadingTranslations: true });
    render(<CapacitiesTreeVisualization />);
    expect(screen.getByTestId('tree-skeleton')).toBeInTheDocument();
  });

  it('shows skeleton when isLoaded is false', () => {
    mockStoreState({ isLoaded: false });
    render(<CapacitiesTreeVisualization />);
    expect(screen.getByTestId('tree-skeleton')).toBeInTheDocument();
  });

  it('shows empty state message when no root capacities exist', () => {
    mockStoreState();
    render(<CapacitiesTreeVisualization />);
    expect(screen.getByText('Nenhuma capacidade encontrada.')).toBeInTheDocument();
  });

  it('passes the correct number of root capacities to D3TreeVisualization', () => {
    render(<CapacitiesTreeVisualization />);
    const d3Tree = screen.getByTestId('d3-tree');
    expect(d3Tree.getAttribute('data-count')).toBe('2');
  });

  it('maps root capacity names through getName', () => {
    const mockGetName = jest.fn((code: number) => `Translated ${code}`);
    mockStoreState({
      getName: mockGetName,
      getRootCapacities: jest.fn(() => [{ code: 10, name: 'fallback', color: 'organizational' }]),
    });

    render(<CapacitiesTreeVisualization />);
    expect(screen.getByTestId('d3-tree')).toBeInTheDocument();
    expect(mockGetName).toHaveBeenCalledWith(10);
  });

  it('includes children in the tree data', () => {
    mockStoreState({
      getName: jest.fn((code: number) => `Name ${code}`),
      getDescription: jest.fn(() => 'desc'),
      getWdCode: jest.fn(() => 'Q1'),
      getMetabaseCode: jest.fn(() => 'M1'),
      getChildren: jest.fn((code: number) =>
        code === 10 ? [{ code: 11, name: 'child', color: 'organizational' }] : []
      ),
      getRootCapacities: jest.fn(() => [{ code: 10, name: 'org', color: 'organizational' }]),
    });

    render(<CapacitiesTreeVisualization />);
    expect(screen.getByTestId('d3-tree')).toBeInTheDocument();
  });
});
