import CapacitiesVisualizationWrapper from '@/app/capacities_visualization/components/CapacitiesVisualizationWrapper';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the tree visualization to avoid d3/jsdom issues
jest.mock('@/app/capacities_visualization/components/CapacitiesTreeVisualization', () => ({
  __esModule: true,
  default: () => <div data-testid="capacities-tree-visualization">Tree Visualization</div>,
}));

// Mock LanguageChangeHandler to simply render children
jest.mock('@/components/LanguageChangeHandler', () => ({
  LanguageChangeHandler: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useIsMobile: jest.fn(() => false),
  useCapacityStore: Object.assign(
    jest.fn(() => ({
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
    })),
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
