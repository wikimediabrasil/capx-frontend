'use client';
import LoadingState from '@/components/LoadingState';
import { useLanguage, useDarkMode, useCapacityStore } from '@/stores';
import { useSession } from 'next-auth/react';
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
  const language = useLanguage();
  const { updateLanguage, isLoadingTranslations, language: cacheLanguage } = useCapacityStore();
  const darkMode = useDarkMode();
  const { data: session } = useSession();
  const token = session?.user?.token;

  // Update language when app language changes
  useEffect(() => {
    if (language !== cacheLanguage && !isLoadingTranslations && token) {
      updateLanguage(language, token);
    }
  }, [language, cacheLanguage, updateLanguage, isLoadingTranslations, token]);

  // Show loading when actively loading translations
  if (isLoadingTranslations) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? 'bg-capx-dark-box-bg text-white' : 'bg-capx-light-bg text-gray-900'}`}
      >
        <LoadingState fullScreen={false} />
        <div className="mt-8 text-center">
          <p
            className={`text-lg font-medium ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'}`}
          >
            Loading translations for {language}...
          </p>
          <p
            className={`text-sm mt-2 ${darkMode ? 'text-capx-dark-box-bg' : 'text-capx-light-bg'}`}
          >
            Please wait while we prepare the capacity data
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
