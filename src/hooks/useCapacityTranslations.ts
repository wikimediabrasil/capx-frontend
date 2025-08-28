import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { capacityService } from '@/services/capacityService';
import { useCallback, useEffect, useState } from 'react';

interface UseCapacityTranslationsReturn {
  isLoading: boolean;
  error: string | null;
  refreshTranslations: () => Promise<void>;
  getTranslatedCapacity: (code: number) => { name: string; description: string } | null;
}

/**
 * Hook para gerenciar traduções das capacidades
 * Fornece funcionalidades para buscar, cachear e acessar traduções das capacidades
 */
export function useCapacityTranslations(): UseCapacityTranslationsReturn {
  const { language } = useApp();
  const { refreshTranslations, getCapacity, isLoaded } = useCapacityCache();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache local para traduções já buscadas
  const [translationsCache, setTranslationsCache] = useState<
    Record<number, { name: string; description: string }>
  >({});

  // Função para atualizar traduções quando o idioma mudar
  const handleLanguageChange = useCallback(async () => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      setError(null);

      await refreshTranslations(language);
      console.log(`Traduções atualizadas para o idioma: ${language}`);
    } catch (err) {
      console.error('Erro ao atualizar traduções:', err);
      setError('Erro ao atualizar traduções');
    } finally {
      setIsLoading(false);
    }
  }, [refreshTranslations, language, isLoaded]);

  // Atualizar traduções quando o idioma mudar
  useEffect(() => {
    handleLanguageChange();
  }, [handleLanguageChange]);

  // Função para buscar traduções específicas de capacidades
  const fetchSpecificTranslations = useCallback(
    async (capacityCodes: number[]) => {
      if (!isLoaded) return {};

      try {
        setIsLoading(true);
        setError(null);

        // Filtrar apenas capacidades que têm wd_code
        const capacitiesWithWdCode = capacityCodes
          .map(code => {
            const capacity = getCapacity(code);
            return capacity?.wd_code ? { code, wd_code: capacity.wd_code } : null;
          })
          .filter(Boolean) as Array<{ code: number; wd_code: string }>;

        if (capacitiesWithWdCode.length === 0) {
          console.warn('Nenhuma capacidade com wd_code encontrada para tradução');
          return {};
        }

        const results = await capacityService.fetchTranslationsWithFallback(
          capacitiesWithWdCode,
          language
        );

        // Processar resultados
        const newTranslations: Record<number, { name: string; description: string }> = {};

        results.forEach(result => {
          if (result.wd_code && result.name) {
            const code = Number(result.wd_code.replace('Q', ''));
            newTranslations[code] = {
              name: result.name,
              description: result.description || '',
            };
          }
        });

        // Atualizar cache local
        setTranslationsCache(prev => ({ ...prev, ...newTranslations }));

        return newTranslations;
      } catch (err) {
        console.error('Erro ao buscar traduções específicas:', err);
        setError('Erro ao buscar traduções específicas');
        return {};
      } finally {
        setIsLoading(false);
      }
    },
    [getCapacity, language, isLoaded]
  );

  // Função para obter uma capacidade traduzida
  const getTranslatedCapacity = useCallback(
    (code: number): { name: string; description: string } | null => {
      // Verificar se já temos a tradução no cache local
      if (translationsCache[code]) {
        return translationsCache[code];
      }

      // Se não temos, buscar a tradução
      fetchSpecificTranslations([code]);
      return null;
    },
    [translationsCache, fetchSpecificTranslations]
  );

  // Função para atualizar todas as traduções
  const refreshAllTranslations = useCallback(async () => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      setError(null);

      await refreshTranslations(language);
      console.log('Todas as traduções foram atualizadas');
    } catch (err) {
      console.error('Erro ao atualizar todas as traduções:', err);
      setError('Erro ao atualizar todas as traduções');
    } finally {
      setIsLoading(false);
    }
  }, [refreshTranslations, language, isLoaded]);

  return {
    isLoading,
    error,
    refreshTranslations: refreshAllTranslations,
    getTranslatedCapacity,
  };
}
