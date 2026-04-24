'use client';
import { CapacityDirectorySkeleton } from '@/components/skeletons';
import { useCapacityStore, useLanguage } from '@/stores';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

/**
 * Componente para gerenciar mudanças de idioma e atualizar automaticamente
 * as traduções das capacidades quando o idioma mudar
 */
export function LanguageChangeHandler({ children }: Readonly<{ children: React.ReactNode }>) {
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

function LanguageChangeHandlerInternal({ children }: Readonly<{ children: React.ReactNode }>) {
  const language = useLanguage();
  const { updateLanguage, isLoadingTranslations, language: cacheLanguage } = useCapacityStore();
  const { data: session } = useSession();
  const token = session?.user?.token;

  // Update language when app language changes
  useEffect(() => {
    if (language !== cacheLanguage && !isLoadingTranslations && token) {
      updateLanguage(language, token);
    }
  }, [language, cacheLanguage, updateLanguage, isLoadingTranslations, token]);

  // Show skeleton when actively loading translations
  if (isLoadingTranslations) {
    return <CapacityDirectorySkeleton />;
  }

  return <>{children}</>;
}
