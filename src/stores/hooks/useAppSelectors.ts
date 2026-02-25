'use client';

import { useAppStore } from '../appStore';

/**
 * Selector hooks for app store
 * These provide optimized subscriptions - components only re-render when their specific data changes
 */

// Get mobile status
export const useIsMobileView = (): boolean => {
  return useAppStore(state => state.isMobile);
};

// Get mobile menu status
export const useMobileMenu = (): boolean => {
  return useAppStore(state => state.mobileMenuStatus);
};

// Get current language
export const useCurrentLanguage = (): string => {
  return useAppStore(state => state.language);
};

// Get page content/translations
export const useTranslations = (): Record<string, string> => {
  return useAppStore(state => state.pageContent);
};

// Get a specific translation key
export const useTranslation = (key: string): string => {
  return useAppStore(state => state.pageContent[key] || key);
};

// Get session data
export const useSessionData = (): any => {
  return useAppStore(state => state.session);
};

// Get mounted status
export const useIsMounted = (): boolean => {
  return useAppStore(state => state.mounted);
};

// Combined hook for navigation components
export const useNavigationState = () => {
  const store = useAppStore();
  return {
    isMobile: store.isMobile,
    mobileMenuStatus: store.mobileMenuStatus,
    setMobileMenuStatus: store.setMobileMenuStatus,
    language: store.language,
    setLanguage: store.setLanguage,
  };
};

// Combined hook for language selection
export const useLanguageState = () => {
  const store = useAppStore();
  return {
    language: store.language,
    setLanguage: store.setLanguage,
    pageContent: store.pageContent,
    setPageContent: store.setPageContent,
  };
};
