import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

import { useLanguage, useCapacityStore } from '@/stores';
/**
 * Hook for synchronizing translations with language changes
 * Applies cached translations to main fields when the language changes
 */
export function useTranslationSync() {
  const language = useLanguage();
  const { updateLanguage, isLoaded } = useCapacityStore();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const lastLanguage = useRef<string>('');

  useEffect(() => {
    // Only proceed if cache is loaded, we have a token, and language has changed
    if (!isLoaded || !token || language === lastLanguage.current) {
      return;
    }

    // Apply cached translations for the new language
    if (lastLanguage.current !== '') {
      updateLanguage(language, token);
    }

    lastLanguage.current = language;
  }, [language, isLoaded, updateLanguage, token]);

  return {
    currentLanguage: language,
    isLoaded,
  };
}
