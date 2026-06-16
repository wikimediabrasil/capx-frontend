jest.mock('@/services/capacityService', () => ({
  capacityService: { fetchCapacities: jest.fn(), fetchCapacitiesByType: jest.fn() },
}));
jest.mock('@/lib/utils/capacitiesUtils', () => ({
  isInvalidCapacityLabel: jest.fn(
    (name: string) => !name || name.startsWith('http') || /^Q\d+$/i.test(name)
  ),
  sanitizeCapacityName: jest.fn((name: string, code: number) =>
    !name || name.startsWith('http') ? `Capacity ${code}` : name.trim()
  ),
  getCapacityColor: jest.fn(() => '#000000'),
  getCapacityIcon: jest.fn(() => 'icon.svg'),
  applyWikidataNameFallback: jest.fn(async (results: any) => results),
  fetchCapacitiesWithFallback: jest.fn(async () => []),
}));

// Ensure localStorage has removeItem
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

import { useCapacityStore } from '@/stores/capacityStore';
import { act } from '@testing-library/react';

describe('capacityStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to clean state without calling clearCache (which uses localStorage.removeItem)
    useCapacityStore.setState({
      capacities: {},
      children: {},
      language: 'en',
      timestamp: 0,
      isLoadingTranslations: false,
      isLoaded: false,
    });
  });

  it('has empty initial state', () => {
    const state = useCapacityStore.getState();
    expect(state.capacities).toEqual({});
    expect(state.children).toEqual({});
    expect(state.isLoadingTranslations).toBe(false);
  });

  describe('getter methods', () => {
    beforeEach(() => {
      useCapacityStore.setState({
        capacities: {
          10: {
            code: 10,
            name: 'Organizational',
            description: 'Org skills',
            wd_code: 'Q1',
            metabase_code: 'M1',
            color: '#0078D4',
            icon: 'org.svg',
            hasChildren: true,
            level: 1,
            category: 'organizational',
          } as any,
          100: {
            code: 100,
            name: 'Sub Capacity',
            description: '',
            wd_code: 'Q2',
            metabase_code: '',
            color: '#0078D4',
            icon: 'org.svg',
            hasChildren: false,
            level: 2,
            category: 'organizational',
          } as any,
        },
        children: { 10: [100] },
      });
    });

    it('getName returns formatted name', () => {
      expect(useCapacityStore.getState().getName(10)).toBe('Organizational');
    });

    it('getName returns fallback for missing capacity', () => {
      expect(useCapacityStore.getState().getName(999)).toBe('Capacity 999');
    });

    it('getDescription returns description', () => {
      expect(useCapacityStore.getState().getDescription(10)).toBe('Org skills');
    });

    it('getDescription returns empty for missing', () => {
      expect(useCapacityStore.getState().getDescription(999)).toBe('');
    });

    it('getWdCode returns wd_code', () => {
      expect(useCapacityStore.getState().getWdCode(10)).toBe('Q1');
    });

    it('getMetabaseCode returns metabase_code', () => {
      expect(useCapacityStore.getState().getMetabaseCode(10)).toBe('M1');
    });

    it('getColor returns cached color', () => {
      expect(useCapacityStore.getState().getColor(10)).toBe('#0078D4');
    });

    it('getIcon returns cached icon', () => {
      expect(useCapacityStore.getState().getIcon(10)).toBe('org.svg');
    });

    it('getChildren returns child capacities', () => {
      const children = useCapacityStore.getState().getChildren(10);
      expect(children).toHaveLength(1);
      expect(children[0].code).toBe(100);
    });

    it('getCapacity returns capacity or null', () => {
      expect(useCapacityStore.getState().getCapacity(10)).toBeTruthy();
      expect(useCapacityStore.getState().getCapacity(999)).toBeNull();
    });

    it('getRootCapacities returns level 1', () => {
      const roots = useCapacityStore.getState().getRootCapacities();
      expect(roots).toHaveLength(1);
      expect(roots[0].code).toBe(10);
    });

    it('hasChildren returns boolean', () => {
      expect(useCapacityStore.getState().hasChildren(10)).toBe(true);
      expect(useCapacityStore.getState().hasChildren(100)).toBe(false);
    });
  });

  describe('setCache', () => {
    it('sets cache from external data', () => {
      act(() => {
        useCapacityStore.getState().setCache({
          capacities: { 1: { code: 1, name: 'Test' } as any },
          children: {},
          language: 'pt',
          timestamp: 12345,
        });
      });

      const state = useCapacityStore.getState();
      expect(state.language).toBe('pt');
      expect(state.capacities[1].name).toBe('Test');
      expect(state.isLoaded).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('resets everything', () => {
      useCapacityStore.setState({
        capacities: { 1: {} as any },
        language: 'pt',
        isLoaded: true,
      });

      act(() => {
        useCapacityStore.getState().clearCache();
      });

      const state = useCapacityStore.getState();
      expect(state.capacities).toEqual({});
      expect(state.language).toBe('en');
      expect(state.isLoaded).toBe(false);
    });
  });

  describe('updateCapacityTranslation', () => {
    it('updates name and description', () => {
      useCapacityStore.setState({
        capacities: {
          10: {
            code: 10,
            name: 'Old Name',
            description: 'Old Desc',
            isFallbackTranslation: true,
            isFallbackLabel: true,
            isFallbackDescription: true,
          } as any,
        },
      });

      act(() => {
        useCapacityStore
          .getState()
          .updateCapacityTranslation(10, 'New Name', 'New Desc', true, true);
      });

      const cap = useCapacityStore.getState().capacities[10];
      expect(cap.name).toBe('New Name');
      expect(cap.description).toBe('New Desc');
      expect(cap.isFallbackLabel).toBe(false);
      expect(cap.isFallbackDescription).toBe(false);
    });

    it('does nothing for non-existent capacity', () => {
      act(() => {
        useCapacityStore
          .getState()
          .updateCapacityTranslation(999, 'Name', 'Desc', true, true);
      });
      expect(useCapacityStore.getState().capacities[999]).toBeUndefined();
    });
  });
});
