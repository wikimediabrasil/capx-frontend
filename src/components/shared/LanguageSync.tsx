'use client';

import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useEffect, useState } from 'react';

/**
 * Hook for managing language synchronization between app context and capacity cache
 * Reduces duplicated language sync logic across components
 */
export const useLanguageSync = () => {
  const { language: appLanguage } = useApp();
  const {
    isLoaded: isCacheLoaded,
    isLoadingTranslations,
    language: cacheLanguage,
    updateLanguage,
  } = useCapacityCache();

  const [isLanguageChanging, setIsLanguageChanging] = useState(false);

  // Detect when app language changes and update capacity cache
  useEffect(() => {
    if (appLanguage && cacheLanguage && appLanguage !== cacheLanguage) {
      setIsLanguageChanging(true);
      updateLanguage(appLanguage);
    }
  }, [appLanguage, cacheLanguage, updateLanguage]);

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