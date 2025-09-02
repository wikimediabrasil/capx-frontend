'use client';
import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
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
  const { isLoaded, isLoadingTranslations } = useCapacityCache();

  // Show loading only if we're actively loading translations
  // Don't block rendering if cache is loaded but descriptions aren't ready yet
  if (isLoadingTranslations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-pulse h-4 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
          <p>Loading translations for {language}...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
