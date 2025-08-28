'use client';
import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import React, { useEffect, useState } from 'react';

/**
 * Componente para gerenciar mudanças de idioma e atualizar automaticamente
 * as traduções das capacidades quando o idioma mudar
 */
export function LanguageChangeHandler({ children }: { children: React.ReactNode }) {
  const { language } = useApp();
  const { refreshTranslations, isLoaded } = useCapacityCache();
  const [lastLanguage, setLastLanguage] = useState(language);

  // Handle language changes and update capacity translations
  useEffect(() => {
    if (language !== lastLanguage && isLoaded) {
      console.log(
        `Language changed from ${lastLanguage} to ${language}. Updating capacity translations...`
      );

      // Update capacity translations for the new language
      refreshTranslations(language)
        .then(() => {
          console.log(`Capacity translations updated for language: ${language}`);
        })
        .catch(error => {
          console.error(`Error updating capacity translations for language ${language}:`, error);
        });

      setLastLanguage(language);
    }
  }, [language, lastLanguage, isLoaded, refreshTranslations]);

  return <>{children}</>;
}
