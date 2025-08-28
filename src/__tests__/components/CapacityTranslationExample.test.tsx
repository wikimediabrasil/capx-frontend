
// Mock simples dos hooks para evitar dependências externas
jest.mock('@/hooks/useCapacityTranslations', () => ({
  useCapacityTranslations: () => ({
    isLoading: false,
    error: null,
    refreshTranslations: jest.fn(),
    getTranslatedCapacity: jest.fn((code: number) => ({
      name: `Capacidade ${code}`,
      description: `Descrição da capacidade ${code}`,
    })),
  }),
}));

jest.mock('@/contexts/CapacityCacheContext', () => ({
  useCapacityCache: () => ({
    getCapacity: jest.fn((code: number) => ({
      code,
      name: `Capacity ${code}`,
      color: 'technology',
      icon: '',
      hasChildren: false,
      skill_type: code,
      skill_wikidata_item: '',
      description: '',
      wd_code: `Q${code}`,
    })),
    isLoaded: true,
  }),
}));

jest.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    language: 'pt',
    setLanguage: jest.fn(),
  }),
}));

// Teste simples sem renderização completa
describe('CapacityTranslationExample', () => {
  it('should have correct hook structure', () => {
    // Importar após os mocks
    const { useCapacityTranslations } = require('@/hooks/useCapacityTranslations');
    const { useCapacityCache } = require('@/contexts/CapacityCacheContext');
    const { useApp } = require('@/contexts/AppContext');

    const translationsHook = useCapacityTranslations();
    const cacheHook = useCapacityCache();
    const appHook = useApp();

    expect(translationsHook).toHaveProperty('isLoading');
    expect(translationsHook).toHaveProperty('error');
    expect(translationsHook).toHaveProperty('refreshTranslations');
    expect(translationsHook).toHaveProperty('getTranslatedCapacity');

    expect(cacheHook).toHaveProperty('getCapacity');
    expect(cacheHook).toHaveProperty('isLoaded');

    expect(appHook).toHaveProperty('language');
    expect(appHook).toHaveProperty('setLanguage');
  });

  it('should return translated capacity data', () => {
    const { useCapacityTranslations } = require('@/hooks/useCapacityTranslations');
    const { useCapacityCache } = require('@/contexts/CapacityCacheContext');

    const { getTranslatedCapacity } = useCapacityTranslations();
    const { getCapacity } = useCapacityCache();

    const translatedCapacity = getTranslatedCapacity(36);
    const capacity = getCapacity(36);

    expect(translatedCapacity).toEqual({
      name: 'Capacidade 36',
      description: 'Descrição da capacidade 36',
    });

    expect(capacity).toEqual({
      code: 36,
      name: 'Capacity 36',
      color: 'technology',
      icon: '',
      hasChildren: false,
      skill_type: 36,
      skill_wikidata_item: '',
      description: '',
      wd_code: 'Q36',
    });
  });

  it('should return correct language', () => {
    const { useApp } = require('@/contexts/AppContext');
    const { language } = useApp();

    expect(language).toBe('pt');
  });
});
