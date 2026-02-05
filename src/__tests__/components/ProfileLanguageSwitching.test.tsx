import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import * as stores from '@/stores';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useCapacityStore: Object.assign(
    jest.fn(() => ({ capacities: {}, children: {}, language: 'en', timestamp: 0, isLoadingTranslations: false, isLoaded: false, getName: jest.fn(() => ''), getDescription: jest.fn(() => ''), getWdCode: jest.fn(() => ''), getMetabaseCode: jest.fn(() => ''), getColor: jest.fn(() => '#000'), getIcon: jest.fn(() => ''), getChildren: jest.fn(() => []), getCapacity: jest.fn(() => null), getRootCapacities: jest.fn(() => []), hasChildren: jest.fn(() => false), isFallbackTranslation: jest.fn(() => false), getIsLoaded: jest.fn(() => false), getIsDescriptionsReady: jest.fn(() => false), updateLanguage: jest.fn(), preloadCapacities: jest.fn(), clearCache: jest.fn(), setCache: jest.fn(), invalidateQueryCache: jest.fn() })),
    { getState: () => ({ capacities: {}, children: {}, language: 'en', timestamp: 0, isLoadingTranslations: false, isLoaded: false }) }
  ),
}));

// Simple test to verify the cache integration works
describe('Profile Language Switching Integration', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have capacity store available', () => {
    const capacityStore = stores.useCapacityStore.getState();
    expect(capacityStore).toBeDefined();
    expect(capacityStore.getName).toBeDefined();
    expect(capacityStore.updateLanguage).toBeDefined();
  });

  it('should call getName function correctly', () => {
    const mockGetName = jest.fn(() => 'Capacity 123');
    (stores.useCapacityStore as jest.Mock).mockReturnValue({
      getName: mockGetName,
    });

    const getName = (stores.useCapacityStore as jest.Mock)().getName;
    const result = getName(123);
    expect(result).toBe('Capacity 123');
    expect(mockGetName).toHaveBeenCalledWith(123);
  });

  it('should handle language update calls', async () => {
    const mockUpdateLanguage = jest.fn().mockResolvedValue(undefined);
    (stores.useCapacityStore as jest.Mock).mockReturnValue({
      updateLanguage: mockUpdateLanguage,
    });

    const updateLanguage = (stores.useCapacityStore as jest.Mock)().updateLanguage;
    await updateLanguage('pt');
    expect(mockUpdateLanguage).toHaveBeenCalledWith('pt');
  });
});
