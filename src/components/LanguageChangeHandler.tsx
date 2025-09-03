'use client';
import LoadingState from '@/components/LoadingState';
import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useEffect, useState } from 'react';

/**
 * Componente para gerenciar mudanças de idioma e atualizar automaticamente
 * as traduções das capacidades quando o idioma mudar
 */
export function LanguageChangeHandler({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Wait for hydration to complete before accessing contexts
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <LanguageChangeHandlerInternal>{children}</LanguageChangeHandlerInternal>;
}

function LanguageChangeHandlerInternal({ children }: { children: React.ReactNode }) {
  const { language } = useApp();
  const { updateLanguage, isLoadingTranslations, language: cacheLanguage } = useCapacityCache();
  const { darkMode } = useTheme();

  // Update language when app language changes
  useEffect(() => {
    if (language !== cacheLanguage && !isLoadingTranslations) {
      updateLanguage(language);
    }
  }, [language, cacheLanguage, updateLanguage, isLoadingTranslations]);

  // Show loading when actively loading translations
  if (isLoadingTranslations) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? 'bg-capx-dark-box-bg text-white' : 'bg-capx-light-bg text-gray-900'}`}>
        <LoadingState fullScreen={false} />
        <div className="mt-8 text-center">
          <p className={`text-lg font-medium ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'}`}>
            Loading translations for {language}...
          </p>
          <p className={`text-sm mt-2 ${darkMode ? 'text-capx-dark-box-bg' : 'text-capx-light-bg'}`}>
            Please wait while we prepare the capacity data
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
