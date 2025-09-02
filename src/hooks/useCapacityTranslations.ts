import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useCallback, useState } from 'react';

interface UseCapacityTranslationsReturn {
  isLoading: boolean;
  error: string | null;
  refreshTranslations: () => Promise<void>;
  getTranslatedCapacity: (code: number) => { name: string; description: string } | null;
}

/**
 * Hook para gerenciar traduções das capacidades
 * Simplificado para usar apenas o cache principal do CapacityCacheContext
 */
export function useCapacityTranslations(): UseCapacityTranslationsReturn {
  const { language } = useApp();
  const { refreshTranslations, getCapacity, isLoaded, isLoadingTranslations } = useCapacityCache();
  const [error, setError] = useState<string | null>(null);

  // Função para obter uma capacidade traduzida diretamente do cache principal
  const getTranslatedCapacity = useCallback(
    (code: number): { name: string; description: string } | null => {
      if (!isLoaded) return null;

      const capacity = getCapacity(code);
      if (!capacity) return null;

      return {
        name: capacity.name || `Capacity ${code}`,
        description: capacity.description || '',
      };
    },
    [isLoaded, getCapacity]
  );

  // Função para atualizar todas as traduções
  const refreshAllTranslations = useCallback(async () => {
    if (!isLoaded) return;

    try {
      setError(null);
      await refreshTranslations(language);
      console.log('Todas as traduções foram atualizadas');
    } catch (err) {
      console.error('Erro ao atualizar todas as traduções:', err);
      setError('Erro ao atualizar todas as traduções');
    }
  }, [refreshTranslations, language, isLoaded]);

  return {
    isLoading: isLoadingTranslations,
    error,
    refreshTranslations: refreshAllTranslations,
    getTranslatedCapacity,
  };
}
