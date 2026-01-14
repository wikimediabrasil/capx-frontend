'use client';

import { useAppStore } from '@/stores/appStore';
import { createContext, useContext, useEffect, useMemo } from 'react';

/**
 * AppContext - Compatibility layer for Zustand migration
 *
 * This context now delegates to the Zustand store internally.
 * All existing consumers continue to work without changes.
 *
 * For new code, consider using the Zustand store directly:
 * import { useAppStore, useIsMobile, useLanguage } from '@/stores';
 */

interface AppContextType {
  isMobile: boolean;
  mobileMenuStatus: boolean;
  setMobileMenuStatus: (value: boolean) => void;
  language: string;
  setLanguage: (value: string) => void;
  pageContent: any;
  setPageContent: (value: any) => void;
  session: any;
  setSession: (value: any) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Get all state and actions from Zustand store
  const store = useAppStore();

  // Initialize store on mount (handles resize listener, localStorage, etc.)
  // Note: We use the store's hydrate function directly without including store in deps
  // to avoid infinite re-renders when hydrate updates state
  useEffect(() => {
    const cleanup = useAppStore.getState().hydrate();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoize value object to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      isMobile: store.isMobile,
      mobileMenuStatus: store.mobileMenuStatus,
      setMobileMenuStatus: store.setMobileMenuStatus,
      language: store.language,
      setLanguage: store.setLanguage,
      pageContent: store.pageContent,
      setPageContent: store.setPageContent,
      session: store.session,
      setSession: store.setSession,
    }),
    [
      store.isMobile,
      store.mobileMenuStatus,
      store.setMobileMenuStatus,
      store.language,
      store.setLanguage,
      store.pageContent,
      store.setPageContent,
      store.session,
      store.setSession,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
