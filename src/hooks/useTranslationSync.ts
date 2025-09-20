import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useEffect, useRef } from 'react';

/**
 * Hook for synchronizing translations with language changes
 * Applies cached translations to main fields when the language changes
 */
export function useTranslationSync() {
  const { language } = useApp();
  const { updateLanguage, isLoaded } = useCapacityCache();
  const lastLanguage = useRef<string>('');

  useEffect(() => {
    // Only proceed if cache is loaded and language has changed
    if (!isLoaded || language === lastLanguage.current) {
      return;
    }

    // Apply cached translations for the new language
    if (lastLanguage.current !== '') {
      console.log(
        `🔄 Language changed from ${lastLanguage.current} to ${language}, applying translations`
      );
      const appliedCount = updateLanguage(language);
      console.log(`✅ Applied ${appliedCount} translations for ${language}`);
    }

    lastLanguage.current = language;
  }, [language, isLoaded, updateLanguage]);

  return {
    currentLanguage: language,
    isLoaded,
  };
}
