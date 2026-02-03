'use client';

import { useLanguage, useCapacityStore } from '@/stores';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

/**
 * Hook for managing language synchronization between app context and capacity cache
 * Reduces duplicated language sync logic across components
 */
export const useLanguageSync = () => {
  const appLanguage = useLanguage();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const store = useCapacityStore();

  const isCacheLoaded = store.getIsLoaded();
  const isLoadingTranslations = store.isLoadingTranslations;
  const cacheLanguage = store.language;

  const [isLanguageChanging, setIsLanguageChanging] = useState(false);

  // Detect when app language changes and update capacity cache
  useEffect(() => {
    if (appLanguage && cacheLanguage && appLanguage !== cacheLanguage && token) {
      setIsLanguageChanging(true);
      store.updateLanguage(appLanguage, token);
    }
  }, [appLanguage, cacheLanguage, store, token]);

  // Reset language changing state when translations are loaded
  useEffect(() => {
    if (
      isLanguageChanging &&
      !isLoadingTranslations &&
      isCacheLoaded &&
      appLanguage === cacheLanguage
    ) {
      setIsLanguageChanging(false);
    }
  }, [isLanguageChanging, isLoadingTranslations, isCacheLoaded, appLanguage, cacheLanguage]);

  return {
    isLanguageChanging,
    isLoadingTranslations,
    isCacheLoaded,
    appLanguage,
    cacheLanguage,
  };
};
