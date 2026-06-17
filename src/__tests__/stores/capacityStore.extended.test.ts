// Extended capacity store tests – covers getColor/getIcon without cached values,
// isFallbackTranslation, getIsLoaded, getIsDescriptionsReady, invalidateQueryCache,
// preloadCapacities, and updateLanguage.

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
  getCapacityColor: jest.fn((cat: string) => {
    const map: Record<string, string> = {
      organizational: '#0078D4',
      communication: '#BE0078',
      learning: '#00965A',
      community: '#8E44AD',
      social: '#D35400',
      strategic: '#3498DB',
      technology: '#27AE60',
    };
    return map[cat] || '#000000';
  }),
  getCapacityIcon: jest.fn(() => 'icon.svg'),
  applyWikidataNameFallback: jest.fn(async (results: any) => results),
  fetchCapacitiesWithFallback: jest.fn(async () => []),
}));

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

import { useCapacityStore } from '@/stores/capacityStore';
import { capacityService } from '@/services/capacityService';
import { act } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';

const mockedCapacityService = capacityService as jest.Mocked<typeof capacityService>;

// Minimal valid capacity data
const makeCapacity = (overrides: Partial<any> = {}) => ({
  code: 10,
  name: 'Organizational',
  description: 'Org skills',
  wd_code: 'Q1',
  metabase_code: 'M1',
  color: '', // empty — forces hierarchy lookup
  icon: '', // empty — forces hierarchy lookup
  hasChildren: false,
  level: 1,
  category: 'organizational',
  isFallbackTranslation: false,
  ...overrides,
});

describe('capacityStore - extended', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    useCapacityStore.setState({
      capacities: {},
      children: {},
      language: 'en',
      timestamp: 0,
      isLoadingTranslations: false,
      isLoaded: false,
    });
  });

  // -------------------------------------------------------------------------
  // getColor / getIcon — fallback when capacity has no cached color/icon
  // -------------------------------------------------------------------------
  describe('getColor and getIcon without cached values', () => {
    beforeEach(() => {
      useCapacityStore.setState({
        capacities: {
          10: makeCapacity({ color: '', icon: '' }),
          36: makeCapacity({
            code: 36,
            name: 'Communication',
            category: 'communication',
            color: '',
            icon: '',
          }),
          106: makeCapacity({
            code: 106,
            name: 'Technology',
            category: 'technology',
            color: '',
            icon: '',
          }),
        },
      });
    });

    it('getColor resolves via hierarchy for code starting with "10"', () => {
      const color = useCapacityStore.getState().getColor(10);
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });

    it('getColor resolves via hierarchy for technology code (106)', () => {
      const color = useCapacityStore.getState().getColor(106);
      expect(typeof color).toBe('string');
    });

    it('getIcon resolves via hierarchy when icon is empty', () => {
      const icon = useCapacityStore.getState().getIcon(36);
      expect(typeof icon).toBe('string');
    });

    it('getColor returns cached color when present', () => {
      useCapacityStore.setState({
        capacities: {
          10: makeCapacity({ color: '#FF0000', icon: 'test.svg' }),
        },
      });
      expect(useCapacityStore.getState().getColor(10)).toBe('#FF0000');
    });

    it('getIcon returns cached icon when present', () => {
      useCapacityStore.setState({
        capacities: {
          10: makeCapacity({ color: '#FF0000', icon: 'test.svg' }),
        },
      });
      expect(useCapacityStore.getState().getIcon(10)).toBe('test.svg');
    });

    it('getColor returns computed color for unknown code (defaults to organizational)', () => {
      useCapacityStore.setState({
        capacities: {
          999: makeCapacity({ code: 999, color: '' }),
        },
      });
      const color = useCapacityStore.getState().getColor(999);
      expect(typeof color).toBe('string');
    });
  });

  // -------------------------------------------------------------------------
  // isFallbackTranslation
  // -------------------------------------------------------------------------
  describe('isFallbackTranslation', () => {
    it('returns false when capacity does not exist', () => {
      expect(useCapacityStore.getState().isFallbackTranslation(999)).toBe(false);
    });

    it('returns true when isFallbackTranslation is set', () => {
      useCapacityStore.setState({
        capacities: {
          10: makeCapacity({ isFallbackTranslation: true }),
        },
      });
      expect(useCapacityStore.getState().isFallbackTranslation(10)).toBe(true);
    });

    it('returns false when isFallbackTranslation is false', () => {
      useCapacityStore.setState({
        capacities: {
          10: makeCapacity({ isFallbackTranslation: false }),
        },
      });
      expect(useCapacityStore.getState().isFallbackTranslation(10)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // getIsLoaded / getIsDescriptionsReady
  // -------------------------------------------------------------------------
  describe('computed state getters', () => {
    it('getIsLoaded returns false when capacities is empty', () => {
      expect(useCapacityStore.getState().getIsLoaded()).toBe(false);
    });

    it('getIsLoaded returns true when capacities has entries', () => {
      useCapacityStore.setState({
        capacities: { 10: makeCapacity() },
      });
      expect(useCapacityStore.getState().getIsLoaded()).toBe(true);
    });

    it('getIsDescriptionsReady returns false when loading translations', () => {
      useCapacityStore.setState({
        capacities: { 10: makeCapacity() },
        isLoadingTranslations: true,
      });
      expect(useCapacityStore.getState().getIsDescriptionsReady()).toBe(false);
    });

    it('getIsDescriptionsReady returns true when capacities loaded and not loading', () => {
      useCapacityStore.setState({
        capacities: { 10: makeCapacity() },
        isLoadingTranslations: false,
      });
      expect(useCapacityStore.getState().getIsDescriptionsReady()).toBe(true);
    });

    it('getIsDescriptionsReady returns false when capacities is empty', () => {
      useCapacityStore.setState({
        capacities: {},
        isLoadingTranslations: false,
      });
      expect(useCapacityStore.getState().getIsDescriptionsReady()).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // getName edge cases
  // -------------------------------------------------------------------------
  describe('getName edge cases', () => {
    it('returns formatted (capitalized first letter, rest lowercase) name', () => {
      useCapacityStore.setState({
        capacities: {
          36: makeCapacity({ code: 36, name: 'cOMMUNICATION' }),
        },
      });
      expect(useCapacityStore.getState().getName(36)).toBe('Communication');
    });

    it('returns sanitized name when name is a URL', () => {
      useCapacityStore.setState({
        capacities: {
          10: makeCapacity({ name: 'https://wikidata.org/entity/Q10' }),
        },
      });
      expect(useCapacityStore.getState().getName(10)).toBe('Capacity 10');
    });
  });

  // -------------------------------------------------------------------------
  // getChildren edge cases
  // -------------------------------------------------------------------------
  describe('getChildren edge cases', () => {
    it('returns empty array when no children registered', () => {
      useCapacityStore.setState({
        capacities: { 10: makeCapacity() },
        children: {},
      });
      expect(useCapacityStore.getState().getChildren(10)).toEqual([]);
    });

    it('filters out missing capacities from children list', () => {
      useCapacityStore.setState({
        capacities: {
          10: makeCapacity(),
          // 100 is listed as child but not in capacities
        },
        children: { 10: [100, 101] },
      });
      expect(useCapacityStore.getState().getChildren(10)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // invalidateQueryCache
  // -------------------------------------------------------------------------
  describe('invalidateQueryCache', () => {
    it('calls queryClient.removeQueries and invalidateQueries', () => {
      const queryClient = {
        removeQueries: jest.fn(),
        invalidateQueries: jest.fn(),
      } as unknown as QueryClient;

      act(() => {
        useCapacityStore.getState().invalidateQueryCache(queryClient, 'en');
      });

      expect(queryClient.removeQueries).toHaveBeenCalled();
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // preloadCapacities
  // -------------------------------------------------------------------------
  describe('preloadCapacities', () => {
    it('calls updateLanguage with current language and token', async () => {
      const mockUpdateLanguage = jest.fn().mockResolvedValue(undefined);
      useCapacityStore.setState({ language: 'pt' });

      // Temporarily replace updateLanguage
      const original = useCapacityStore.getState().updateLanguage;
      useCapacityStore.setState({ updateLanguage: mockUpdateLanguage } as any);

      await act(async () => {
        await useCapacityStore.getState().preloadCapacities('my-token');
      });

      expect(mockUpdateLanguage).toHaveBeenCalledWith('pt', 'my-token');

      // Restore
      useCapacityStore.setState({ updateLanguage: original } as any);
    });
  });

  // -------------------------------------------------------------------------
  // updateLanguage
  // -------------------------------------------------------------------------
  describe('updateLanguage', () => {
    it('does nothing when token is empty', async () => {
      await act(async () => {
        await useCapacityStore.getState().updateLanguage('en', '');
      });

      expect(mockedCapacityService.fetchCapacities).not.toHaveBeenCalled();
    });

    it('does nothing when already loading translations', async () => {
      useCapacityStore.setState({ isLoadingTranslations: true });

      await act(async () => {
        await useCapacityStore.getState().updateLanguage('en', 'token');
      });

      expect(mockedCapacityService.fetchCapacities).not.toHaveBeenCalled();
    });

    it('skips fetch when cache is valid for the same language', async () => {
      useCapacityStore.setState({
        capacities: { 10: makeCapacity({ name: 'Organizational' }) },
        language: 'en',
        isLoaded: true,
      });

      await act(async () => {
        await useCapacityStore.getState().updateLanguage('en', 'token');
      });

      expect(mockedCapacityService.fetchCapacities).not.toHaveBeenCalled();
    });

    it('sets isLoaded=true when cache is already loaded for same language', async () => {
      useCapacityStore.setState({
        capacities: { 10: makeCapacity({ name: 'Organizational' }) },
        language: 'en',
        isLoaded: false,
        isLoadingTranslations: false,
      });

      await act(async () => {
        await useCapacityStore.getState().updateLanguage('en', 'token');
      });

      expect(useCapacityStore.getState().isLoaded).toBe(true);
    });

    it('fetches root capacities when no cache exists', async () => {
      const rootCapacities = [
        {
          code: 10,
          name: 'Organizational',
          description: '',
          wd_code: 'Q1',
          metabase_code: '',
          hasChildren: true,
          level: 1,
        },
      ];

      mockedCapacityService.fetchCapacities.mockResolvedValueOnce(rootCapacities as any);
      mockedCapacityService.fetchCapacitiesByType.mockResolvedValueOnce({} as any);

      await act(async () => {
        await useCapacityStore.getState().updateLanguage('en', 'token');
      });

      expect(mockedCapacityService.fetchCapacities).toHaveBeenCalled();
      const state = useCapacityStore.getState();
      expect(state.capacities[10]).toBeDefined();
      expect(state.isLoaded).toBe(true);
      expect(state.isLoadingTranslations).toBe(false);
    });

    it('stops if fetchCapacities returns empty array', async () => {
      mockedCapacityService.fetchCapacities.mockResolvedValueOnce([] as any);

      await act(async () => {
        await useCapacityStore.getState().updateLanguage('en', 'token');
      });

      expect(useCapacityStore.getState().isLoadingTranslations).toBe(false);
      expect(Object.keys(useCapacityStore.getState().capacities)).toHaveLength(0);
    });

    it('uses localStorage cache when available for same language', async () => {
      const cachedData = {
        capacities: { 10: makeCapacity({ name: 'Cached Name' }) },
        children: {},
        language: 'en',
        timestamp: Date.now(),
      };
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'capx-unified-cache') return JSON.stringify(cachedData);
        return null;
      });

      await act(async () => {
        await useCapacityStore.getState().updateLanguage('en', 'token');
      });

      // Should NOT call the service since cache was valid
      expect(mockedCapacityService.fetchCapacities).not.toHaveBeenCalled();
      expect(useCapacityStore.getState().capacities[10]?.name).toBe('Cached Name');
    });

    it('handles fetch error gracefully', async () => {
      mockedCapacityService.fetchCapacities.mockRejectedValueOnce(new Error('API error'));

      await act(async () => {
        await useCapacityStore.getState().updateLanguage('en', 'token');
      });

      expect(useCapacityStore.getState().isLoadingTranslations).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // updateCapacityTranslation edge cases
  // -------------------------------------------------------------------------
  describe('updateCapacityTranslation - edge cases', () => {
    it('keeps fallback flags when labelChanged=false and descriptionChanged=false', () => {
      useCapacityStore.setState({
        capacities: {
          10: makeCapacity({
            isFallbackTranslation: true,
            isFallbackLabel: true,
            isFallbackDescription: true,
          }),
        },
      });

      act(() => {
        useCapacityStore.getState().updateCapacityTranslation(10, 'New Name', '', false, false);
      });

      const cap = useCapacityStore.getState().capacities[10];
      expect(cap.isFallbackLabel).toBe(true);
      expect(cap.isFallbackDescription).toBe(true);
    });

    it('clears only label fallback when labelChanged=true but descriptionChanged=false', () => {
      useCapacityStore.setState({
        capacities: {
          10: makeCapacity({
            isFallbackTranslation: true,
            isFallbackLabel: true,
            isFallbackDescription: true,
          }),
        },
      });

      act(() => {
        useCapacityStore.getState().updateCapacityTranslation(10, 'New Name', '', true, false);
      });

      const cap = useCapacityStore.getState().capacities[10];
      expect(cap.isFallbackLabel).toBe(false);
      expect(cap.isFallbackDescription).toBe(true);
      expect(cap.isFallbackTranslation).toBe(true); // still true because desc is fallback
    });

    it('uses overallFallback as default when per-field flags are undefined', () => {
      useCapacityStore.setState({
        capacities: {
          10: makeCapacity({
            isFallbackTranslation: true,
            isFallbackLabel: undefined,
            isFallbackDescription: undefined,
          }),
        },
      });

      act(() => {
        useCapacityStore.getState().updateCapacityTranslation(10, '', '', false, false);
      });

      const cap = useCapacityStore.getState().capacities[10];
      // When flags are undefined, fallback to overallFallback=true
      expect(cap.isFallbackLabel).toBe(true);
      expect(cap.isFallbackDescription).toBe(true);
    });

    it('keeps original name when new name is empty', () => {
      useCapacityStore.setState({
        capacities: {
          10: makeCapacity({ name: 'Original Name' }),
        },
      });

      act(() => {
        useCapacityStore.getState().updateCapacityTranslation(10, '', '', false, false);
      });

      expect(useCapacityStore.getState().capacities[10].name).toBe('Original Name');
    });
  });
});
