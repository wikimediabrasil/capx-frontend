import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useEffect, useRef } from 'react';

/**
 * Hook para sincronizar as traduções com mudanças de idioma
 * Aplica traduções cacheadas aos campos principais quando o idioma muda
 */
export function useTranslationSync() {
  const { language } = useApp();
  const { applyTranslationsToMainFields, isLoaded } = useCapacityCache();
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
      const appliedCount = applyTranslationsToMainFields(language);
      console.log(`✅ Applied ${appliedCount} translations for ${language}`);
    }

    lastLanguage.current = language;
  }, [language, isLoaded, applyTranslationsToMainFields]);

  return {
    currentLanguage: language,
    isLoaded,
  };
}
