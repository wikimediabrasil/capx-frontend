import CapacitiesVisualizationWrapper from '@/app/capacities_visualization/components/CapacitiesVisualizationWrapper';
import { render, screen } from '@testing-library/react';
import React from 'react';

jest.mock('@/app/capacities_visualization/components/CapacitiesTreeVisualization', () => ({
  __esModule: true,
  default: () => <div data-testid="capacities-tree-visualization">Tree Visualization</div>,
}));

jest.mock('@/components/LanguageChangeHandler', () => ({
  LanguageChangeHandler: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/stores', () => {
  const { createStoresMock, createCapacityState } = require('../helpers/componentTestHelpers');
  const base = createStoresMock();
  const capacityState = createCapacityState();
  base.useCapacityStore = Object.assign(
    jest.fn(() => capacityState),
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

describe('CapacitiesVisualizationWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<CapacitiesVisualizationWrapper />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders CapacitiesTreeVisualization inside', () => {
    render(<CapacitiesVisualizationWrapper />);
    expect(screen.getByTestId('capacities-tree-visualization')).toBeInTheDocument();
  });

  it('uses language as key for CapacitiesTreeVisualization', () => {
    const stores = jest.requireMock('@/stores');
    stores.useLanguage.mockReturnValue('pt-BR');

    render(<CapacitiesVisualizationWrapper />);
    expect(screen.getByTestId('capacities-tree-visualization')).toBeInTheDocument();
  });

  it('re-renders tree when language changes', () => {
    const stores = jest.requireMock('@/stores');
    stores.useLanguage.mockReturnValue('en');

    const { rerender } = render(<CapacitiesVisualizationWrapper />);
    expect(screen.getByTestId('capacities-tree-visualization')).toBeInTheDocument();

    stores.useLanguage.mockReturnValue('fr');
    rerender(<CapacitiesVisualizationWrapper />);
    expect(screen.getByTestId('capacities-tree-visualization')).toBeInTheDocument();
  });
});
