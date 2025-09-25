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
 * Hook for managing translations of capacities
 */
export function useCapacityTranslations(): UseCapacityTranslationsReturn {
  const { language } = useApp();
  const { updateLanguage, getCapacity, isLoaded, isLoadingTranslations } = useCapacityCache();
  const [error, setError] = useState<string | null>(null);

  // Function to get a translated capacity directly from the main cache
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

  // Function to update all translations
  const refreshAllTranslations = useCallback(async () => {
    if (!isLoaded) return;

    try {
      setError(null);
      await updateLanguage(language);
    } catch (err) {
      console.error('Error updating all translations:', err);
      setError('Error updating all translations');
    }
  }, [updateLanguage, language, isLoaded]);

  return {
    isLoading: isLoadingTranslations,
    error,
    refreshTranslations: refreshAllTranslations,
    getTranslatedCapacity,
  };
}
