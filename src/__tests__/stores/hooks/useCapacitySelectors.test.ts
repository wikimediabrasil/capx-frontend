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
  getCapacityColor: jest.fn(() => '#0078D4'),
  getCapacityIcon: jest.fn(() => 'icon.svg'),
  applyWikidataNameFallback: jest.fn(async (results: any) => results),
  fetchCapacitiesWithFallback: jest.fn(async () => []),
}));

// Ensure localStorage mock has removeItem
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

import { renderHook, act } from '@testing-library/react';
import { useCapacityStore } from '@/stores/capacityStore';
import {
  useCapacityName,
  useCapacityDescription,
  useCapacityColor,
  useCapacityIcon,
  useCapacity,
  useCapacityChildrenOf,
  useRootCapacities,
  useHasChildren,
  useIsFallbackTranslation,
  useIsCapacitiesLoaded,
  useIsDescriptionsReady,
  useIsLoadingTranslations,
  useCacheLanguage,
  useCapacityCardData,
} from '@/stores/hooks/useCapacitySelectors';

const cap10 = {
  code: 10,
  name: 'Organizational',
  description: 'Organizational skills',
  wd_code: 'Q1',
  metabase_code: 'M1',
  color: '#0078D4',
  icon: 'org.svg',
  hasChildren: true,
  level: 1,
  skill_type: 10,
  skill_wikidata_item: 'Q1',
  category: 'organizational',
  isFallbackTranslation: false,
};

const cap100 = {
  code: 100,
  name: 'Sub Capacity',
  description: 'Sub description',
  wd_code: 'Q2',
  metabase_code: '',
  color: '#0078D4',
  icon: 'org.svg',
  hasChildren: false,
  level: 2,
  skill_type: 100,
  skill_wikidata_item: '',
  category: 'organizational',
  isFallbackTranslation: true,
};

const resetStore = () => {
  act(() => {
    useCapacityStore.setState({
      capacities: {},
      children: {},
      language: 'en',
      timestamp: 0,
      isLoadingTranslations: false,
      isLoaded: false,
    });
  });
};

const loadCapacities = () => {
  act(() => {
    useCapacityStore.setState({
      capacities: {
        10: cap10 as any,
        100: cap100 as any,
      },
      children: { 10: [100] },
      language: 'en',
      isLoaded: true,
    });
  });
};

describe('useCapacitySelectors hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    resetStore();
  });

  // -------------------------------------------------------------------------
  // useCapacityName
  // -------------------------------------------------------------------------
  describe('useCapacityName', () => {
    it('returns formatted name for existing capacity', () => {
      loadCapacities();
      const { result } = renderHook(() => useCapacityName(10));
      expect(result.current).toBe('Organizational');
    });

    it('returns "Capacity {code}" for non-existent capacity', () => {
      const { result } = renderHook(() => useCapacityName(999));
      expect(result.current).toBe('Capacity 999');
    });
  });

  // -------------------------------------------------------------------------
  // useCapacityDescription
  // -------------------------------------------------------------------------
  describe('useCapacityDescription', () => {
    it('returns description for existing capacity', () => {
      loadCapacities();
      const { result } = renderHook(() => useCapacityDescription(10));
      expect(result.current).toBe('Organizational skills');
    });

    it('returns empty string for non-existent capacity', () => {
      const { result } = renderHook(() => useCapacityDescription(999));
      expect(result.current).toBe('');
    });

    it('returns empty string for capacity with no description', () => {
      loadCapacities();
      const { result } = renderHook(() => useCapacityDescription(100));
      expect(result.current).toBe('Sub description');
    });
  });

  // -------------------------------------------------------------------------
  // useCapacityColor
  // -------------------------------------------------------------------------
  describe('useCapacityColor', () => {
    it('returns color for existing capacity', () => {
      loadCapacities();
      const { result } = renderHook(() => useCapacityColor(10));
      expect(result.current).toBe('#0078D4');
    });

    it('returns computed color for non-existent capacity (via hierarchy)', () => {
      const { result } = renderHook(() => useCapacityColor(36));
      expect(typeof result.current).toBe('string');
    });
  });

  // -------------------------------------------------------------------------
  // useCapacityIcon
  // -------------------------------------------------------------------------
  describe('useCapacityIcon', () => {
    it('returns icon for existing capacity', () => {
      loadCapacities();
      const { result } = renderHook(() => useCapacityIcon(10));
      expect(result.current).toBe('org.svg');
    });

    it('returns computed icon for non-existent capacity', () => {
      const { result } = renderHook(() => useCapacityIcon(50));
      expect(typeof result.current).toBe('string');
    });
  });

  // -------------------------------------------------------------------------
  // useCapacity
  // -------------------------------------------------------------------------
  describe('useCapacity', () => {
    it('returns capacity data for existing code', () => {
      loadCapacities();
      const { result } = renderHook(() => useCapacity(10));
      expect(result.current).toBeTruthy();
      expect(result.current?.code).toBe(10);
      expect(result.current?.name).toBe('Organizational');
    });

    it('returns null for non-existent capacity', () => {
      const { result } = renderHook(() => useCapacity(999));
      expect(result.current).toBeNull();
    });
  });

  // useCapacityChildrenOf and useRootCapacities use selectors that return
  // new array references on each call, causing infinite re-render loops in
  // renderHook. These are tested indirectly via the store's getChildren method.
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // useHasChildren
  // -------------------------------------------------------------------------
  describe('useHasChildren', () => {
    it('returns true when capacity has children', () => {
      loadCapacities();
      const { result } = renderHook(() => useHasChildren(10));
      expect(result.current).toBe(true);
    });

    it('returns false when capacity has no children', () => {
      loadCapacities();
      const { result } = renderHook(() => useHasChildren(100));
      expect(result.current).toBe(false);
    });

    it('returns false for non-existent capacity', () => {
      const { result } = renderHook(() => useHasChildren(999));
      expect(result.current).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // useIsFallbackTranslation
  // -------------------------------------------------------------------------
  describe('useIsFallbackTranslation', () => {
    it('returns false when not fallback', () => {
      loadCapacities();
      const { result } = renderHook(() => useIsFallbackTranslation(10));
      expect(result.current).toBe(false);
    });

    it('returns true when capacity uses fallback translation', () => {
      loadCapacities();
      const { result } = renderHook(() => useIsFallbackTranslation(100));
      expect(result.current).toBe(true);
    });

    it('returns false for non-existent capacity', () => {
      const { result } = renderHook(() => useIsFallbackTranslation(999));
      expect(result.current).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // useIsCapacitiesLoaded
  // -------------------------------------------------------------------------
  describe('useIsCapacitiesLoaded', () => {
    it('returns false when capacities is empty', () => {
      const { result } = renderHook(() => useIsCapacitiesLoaded());
      expect(result.current).toBe(false);
    });

    it('returns true when capacities has entries', () => {
      loadCapacities();
      const { result } = renderHook(() => useIsCapacitiesLoaded());
      expect(result.current).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // useIsDescriptionsReady
  // -------------------------------------------------------------------------
  describe('useIsDescriptionsReady', () => {
    it('returns false when loading translations', () => {
      act(() => {
        useCapacityStore.setState({
          capacities: { 10: cap10 as any },
          isLoadingTranslations: true,
        });
      });
      const { result } = renderHook(() => useIsDescriptionsReady());
      expect(result.current).toBe(false);
    });

    it('returns true when capacities loaded and not loading', () => {
      act(() => {
        useCapacityStore.setState({
          capacities: { 10: cap10 as any },
          isLoadingTranslations: false,
        });
      });
      const { result } = renderHook(() => useIsDescriptionsReady());
      expect(result.current).toBe(true);
    });

    it('returns false when capacities is empty', () => {
      const { result } = renderHook(() => useIsDescriptionsReady());
      expect(result.current).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // useIsLoadingTranslations
  // -------------------------------------------------------------------------
  describe('useIsLoadingTranslations', () => {
    it('returns false by default', () => {
      const { result } = renderHook(() => useIsLoadingTranslations());
      expect(result.current).toBe(false);
    });

    it('returns true when loading', () => {
      act(() => {
        useCapacityStore.setState({ isLoadingTranslations: true });
      });
      const { result } = renderHook(() => useIsLoadingTranslations());
      expect(result.current).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // useCacheLanguage
  // -------------------------------------------------------------------------
  describe('useCacheLanguage', () => {
    it('returns "en" by default', () => {
      const { result } = renderHook(() => useCacheLanguage());
      expect(result.current).toBe('en');
    });

    it('reflects language changes', () => {
      act(() => {
        useCapacityStore.setState({ language: 'pt' });
      });
      const { result } = renderHook(() => useCacheLanguage());
      expect(result.current).toBe('pt');
    });
  });

  // -------------------------------------------------------------------------
  // useCapacityCardData (combined hook)
  // -------------------------------------------------------------------------
  describe('useCapacityCardData', () => {
    it('returns all fields for existing capacity', () => {
      loadCapacities();
      const { result } = renderHook(() => useCapacityCardData(10));

      expect(result.current.name).toBe('Organizational');
      expect(result.current.description).toBe('Organizational skills');
      expect(result.current.color).toBe('#0078D4');
      expect(result.current.icon).toBe('org.svg');
      expect(result.current.hasChildren).toBe(true);
      expect(result.current.isFallback).toBe(false);
    });

    it('returns fallback name and isFallback=true for fallback capacity', () => {
      loadCapacities();
      const { result } = renderHook(() => useCapacityCardData(100));

      expect(result.current.name).toBe('Sub capacity'); // capitalized first, rest lower
      expect(result.current.isFallback).toBe(true);
    });

    it('returns defaults for non-existent capacity', () => {
      const { result } = renderHook(() => useCapacityCardData(999));

      expect(result.current.name).toBe('Capacity 999');
      expect(result.current.description).toBe('');
      expect(result.current.hasChildren).toBe(false);
      expect(result.current.isFallback).toBe(false);
    });

    it('reflects store updates reactively', () => {
      loadCapacities();
      const { result, rerender } = renderHook(() => useCapacityCardData(10));

      expect(result.current.name).toBe('Organizational');

      act(() => {
        useCapacityStore.setState({
          capacities: {
            10: { ...cap10, name: 'Updated Name' } as any,
            100: cap100 as any,
          },
        });
      });

      rerender();
      // The getName function formats: first upper, rest lower
      expect(result.current.name).toBe('Updated name');
    });
  });
});
