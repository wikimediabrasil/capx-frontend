'use client';

import { useCapacityStore } from '@/stores/capacityStore';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import React, { createContext, useCallback, useContext, useEffect } from 'react';

/**
 * CapacityCacheContext - Compatibility layer for Zustand migration
 *
 * This context now delegates to the Zustand store internally.
 * All existing consumers continue to work without changes.
 *
 * For new code, consider using the Zustand store directly:
 * import { useCapacityStore } from '@/stores';
 */

interface CapacityCacheContextType {
  // Cache state
  isLoaded: boolean;
  isLoadingTranslations: boolean;
  isDescriptionsReady: boolean;
  language: string;

  // Getter functions
  getName: (code: number) => string;
  getDescription: (code: number) => string;
  getWdCode: (code: number) => string;
  getMetabaseCode: (code: number) => string;
  getColor: (code: number) => string;
  getIcon: (code: number) => string;

  // Hierarchy functions
  getChildren: (parentCode: number) => any[];
  getCapacity: (code: number) => any | null;
  getRootCapacities: () => any[];
  hasChildren: (code: number) => boolean;
  isFallbackTranslation: (code: number) => boolean;

  // Actions
  updateLanguage: (newLanguage: string) => Promise<void>;
  preloadCapacities: () => Promise<void>;
  clearCache: () => void;
}

const CapacityCacheContext = createContext<CapacityCacheContextType | undefined>(undefined);

export const useCapacityCache = () => {
  const context = useContext(CapacityCacheContext);
  if (!context) {
    throw new Error('useCapacityCache must be used within a CapacityCacheProvider');
  }
  return context;
};

export const CapacityCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Get all state and actions from Zustand store
  const store = useCapacityStore();

  // Wrapper for updateLanguage that passes the token automatically
  const updateLanguage = useCallback(
    async (newLanguage: string) => {
      if (!session?.user?.token) {
        return;
      }
      await store.updateLanguage(newLanguage, session.user.token);
      // Invalidate React Query cache
      store.invalidateQueryCache(queryClient, newLanguage);
    },
    [session?.user?.token, store, queryClient]
  );

  // Wrapper for preloadCapacities that passes the token automatically
  const preloadCapacities = useCallback(async () => {
    if (!session?.user?.token) {
      return;
    }
    await store.preloadCapacities(session.user.token);
  }, [session?.user?.token, store]);

  // Wrapper for clearCache that also clears React Query
  const clearCache = useCallback(() => {
    store.clearCache();
    queryClient.clear();
  }, [store, queryClient]);

  // Initialize/hydrate store on mount
  useEffect(() => {
    // Zustand persist middleware handles hydration automatically
    // This effect ensures the store is ready
  }, []);

  // Build context value from Zustand store
  const contextValue: CapacityCacheContextType = {
    // State
    isLoaded: store.getIsLoaded(),
    isLoadingTranslations: store.isLoadingTranslations,
    isDescriptionsReady: store.getIsDescriptionsReady(),
    language: store.language,

    // Getters (delegate directly to store)
    getName: store.getName,
    getDescription: store.getDescription,
    getWdCode: store.getWdCode,
    getMetabaseCode: store.getMetabaseCode,
    getColor: store.getColor,
    getIcon: store.getIcon,
    getChildren: store.getChildren,
    getCapacity: store.getCapacity,
    getRootCapacities: store.getRootCapacities,
    hasChildren: store.hasChildren,
    isFallbackTranslation: store.isFallbackTranslation,

    // Actions (wrapped to inject token)
    updateLanguage,
    preloadCapacities,
    clearCache,
  };

  return (
    <CapacityCacheContext.Provider value={contextValue}>{children}</CapacityCacheContext.Provider>
  );
};
