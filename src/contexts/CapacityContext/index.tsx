'use client';

import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useCapacityDescription } from '@/hooks/useCapacitiesQuery';
import { useSession } from 'next-auth/react';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// Types for the context
type NameMap = Record<number, string>;
type DescriptionMap = Record<number, string>;
type WdCodeMap = Record<number, string>;
type MetabaseCodeMap = Record<number, string>;

interface CapacityContextType {
  // Get names and descriptions
  getName: (code: number) => string;
  getDescription: (code: number) => string;
  getWdCode: (code: number) => string;
  getMetabaseCode: (code: number) => string;

  // Request description safely (keeping for compatibility)
  requestDescription: (code: number) => Promise<string>;

  // Check if description has been requested
  isRequested: (code: number) => boolean;

  // For internal use
  _addDescription?: (
    code: number,
    description: string,
    wdCode: string,
    metabaseCode?: string
  ) => void;
}

// Persistent translations between navigations
let cachedNames: NameMap = {};
let cachedDescriptions: DescriptionMap = {};
let cachedWdCodes: WdCodeMap = {};
let cachedMetabaseCodes: MetabaseCodeMap = {};
const requestedTranslations = new Set<number>();

// Initialize localStorage cache
if (typeof window !== 'undefined') {
  try {
    const savedTranslations = localStorage.getItem('capx-translations-cache');
    if (savedTranslations) {
      const parsed = JSON.parse(savedTranslations);
      cachedNames = parsed.names || {};
      cachedDescriptions = parsed.descriptions || {};
      cachedWdCodes = parsed.wdCodes || {};
      cachedMetabaseCodes = parsed.metabaseCodes || {};
    }
  } catch (error) {
    console.error('Erro ao carregar traduções do cache:', error);
  }
}

// Save translations to localStorage
const saveTranslationsCache = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      'capx-translations-cache',
      JSON.stringify({
        names: cachedNames,
        descriptions: cachedDescriptions,
        wdCodes: cachedWdCodes,
        metabaseCodes: cachedMetabaseCodes,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error('Erro ao salvar traduções no cache:', error);
  }
};

// Component that fetches descriptions in the background
const DescriptionFetcher = ({ code, language }: { code: number; language: string }) => {
  const context = useContext(CapacityContext);
  const { data, isSuccess } = useCapacityDescription(code, language);
  const processedRef = useRef(false);
  const { data: session } = useSession();

  React.useEffect(() => {
    // Check if we already have descriptions in cache
    if (cachedDescriptions[code] && cachedWdCodes[code] && !processedRef.current) {
      processedRef.current = true;
      if (context?._addDescription) {
        context._addDescription(
          code,
          cachedDescriptions[code],
          cachedWdCodes[code],
          cachedMetabaseCodes[code]
        );
      }
      return;
    }

    // Avoid updates during component unmount
    let isMounted = true;

    if (isSuccess && data && !processedRef.current && context?._addDescription && isMounted) {
      processedRef.current = true;
      // Save in cache (now includes name)
      cachedNames[code] = data.name || '';
      cachedDescriptions[code] = data.description || '';
      cachedWdCodes[code] = data.wdCode || '';
      cachedMetabaseCodes[code] = data.metabaseCode || '';

      // Update context
      context._addDescription(
        code,
        data.description || '',
        data.wdCode || '',
        data.metabaseCode || ''
      );

      // Persist data
      saveTranslationsCache();
    }

    return () => {
      isMounted = false;
    };
  }, [isSuccess, data, code, context]);

  return null;
};

// Context for descriptions
const CapacityContext = createContext<CapacityContextType | null>(null);

// Global state controller for descriptions
const globalDescriptionStore = {
  names: { ...cachedNames } as NameMap,
  descriptions: { ...cachedDescriptions } as DescriptionMap,
  wdCodes: { ...cachedWdCodes } as WdCodeMap,
  metabaseCodes: { ...cachedMetabaseCodes } as MetabaseCodeMap,
  requestedCodes: new Set<number>(requestedTranslations),
  pendingCodes: new Set<number>(),
  subscribers: new Set<() => void>(),
  isNotifying: false,
  pendingNotification: false,

  // Register description
  addDescription(code: number, description: string, wdCode: string, metabaseCode?: string) {
    // Don't update if there are no changes
    if (
      this.descriptions[code] === description &&
      this.wdCodes[code] === wdCode &&
      this.metabaseCodes[code] === metabaseCode
    ) {
      return false;
    }

    this.descriptions[code] = description;
    this.wdCodes[code] = wdCode;
    if (metabaseCode) {
      this.metabaseCodes[code] = metabaseCode;
    }

    // Also update the permanent caches
    cachedDescriptions[code] = description;
    cachedWdCodes[code] = wdCode;
    if (metabaseCode) {
      cachedMetabaseCodes[code] = metabaseCode;
    }

    this.requestedCodes.delete(code); // Remove from requested list
    this.pendingCodes.delete(code); // Remove from pending list

    // Save to localStorage
    saveTranslationsCache();

    this.notifySubscribers(); // Notify immediately
    return true;
  },

  // Request description
  requestDescription(code: number): boolean {
    if (this.requestedCodes.has(code)) {
      return false;
    }

    this.requestedCodes.add(code);
    requestedTranslations.add(code); // Also update the global set
    this.pendingCodes.add(code);
    this.notifySubscribers(); // Notify immediately
    return true;
  },

  // Get pending codes and clear list
  getPendingAndClear(): number[] {
    const pending = Array.from(this.pendingCodes) as number[];
    this.pendingCodes.clear();
    return pending;
  },

  // Notify subscribers of changes
  notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  },

  // Subscribe to receive notifications of changes
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  },
};

// Make globalDescriptionStore accessible globally for hook integration
if (typeof window !== 'undefined') {
  (window as any).__capacityDescriptionStore = globalDescriptionStore;
  console.log('🌐 globalDescriptionStore attached to window with initial state:', {
    descriptions_count: Object.keys(globalDescriptionStore.descriptions).length,
    wdCodes_count: Object.keys(globalDescriptionStore.wdCodes).length,
    metabaseCodes_count: Object.keys(globalDescriptionStore.metabaseCodes).length,
  });
}

// Provider of the context
export function CapacityDescriptionProvider({
  children,
  language = 'en',
}: {
  children: ReactNode;
  language?: string;
}) {
  // Local state to force re-render when the store changes
  const [, setUpdateCounter] = useState(0);
  const [isDescriptionsLoading, setIsDescriptionsLoading] = useState(false);

  // List of capacities to fetch
  const [codesToFetch, setCodeToFetch] = useState<number[]>([]);
  const { data: session } = useSession();
  const { getCapacity, isLoaded } = useCapacityCache();

  // language is now passed as prop

  // Prefetch descriptions for all capacities when the cache is loaded
  useEffect(() => {
    if (isLoaded && session?.user?.token) {
      // Get all capacity codes from cache
      const allCodes = new Set<number>();
      let descriptionsToFetch = 0;

      // Fetch all capacities from localStorage
      try {
        const savedCache = localStorage.getItem('capx-capacity-cache');
        if (savedCache) {
          const parsedCache = JSON.parse(savedCache);
          if (parsedCache.capacities) {
            // Add all capacity codes to the set
            Object.keys(parsedCache.capacities).forEach(codeStr => {
              const code = Number(codeStr);
              allCodes.add(code);

              // If we don't have description for this capacity, request it
              if (!cachedDescriptions[code] && !globalDescriptionStore.requestedCodes.has(code)) {
                descriptionsToFetch++;
                globalDescriptionStore.requestDescription(code);
              }
            });

            if (descriptionsToFetch > 0) {
              console.log(
                `🔍 Prefetching descriptions for ${descriptionsToFetch} of ${allCodes.size} capacities`
              );
              setIsDescriptionsLoading(true);
            } else {
              console.log(`✅ All ${allCodes.size} capacity descriptions already cached`);
              setIsDescriptionsLoading(false);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao processar cache de capacidades:', error);
        setIsDescriptionsLoading(false);
      }
    }
  }, [isLoaded, session]);

  // Subscribe to updates of the store
  React.useEffect(() => {
    const unsubscribe = globalDescriptionStore.subscribe(() => {
      // Force re-render when the data changes
      setUpdateCounter(prev => prev + 1);

      // Fetch new pending codes
      const pendingCodes = globalDescriptionStore.getPendingAndClear();
      if (pendingCodes.length > 0) {
        setCodeToFetch(prev => [...prev, ...pendingCodes]);
      }
    });

    return unsubscribe;
  }, []);

  // Add description to cache
  const addDescription = useCallback(
    (code: number, description: string, wdCode: string, metabaseCode?: string) => {
      globalDescriptionStore.addDescription(code, description, wdCode, metabaseCode);

      // If there are no more pending codes, disable loading state
      if (codesToFetch.length === 0 && globalDescriptionStore.pendingCodes.size === 0) {
        setIsDescriptionsLoading(false);
      }
    },
    [codesToFetch]
  );

  // Get description from cache
  const getDescription = useCallback((code: number): string => {
    return globalDescriptionStore.descriptions[code] || cachedDescriptions[code] || '';
  }, []);

  // Get WD code from cache
  const getWdCode = useCallback((code: number): string => {
    return globalDescriptionStore.wdCodes[code] || cachedWdCodes[code] || '';
  }, []);

  // Get metabase_code from cache
  const getMetabaseCode = useCallback((code: number): string => {
    const result = globalDescriptionStore.metabaseCodes[code] || cachedMetabaseCodes[code] || '';

    // Debug for any level 2 capacity (codes 11-49 typically)
    if (code >= 11 && code <= 49) {
      console.log(`🔍 getMetabaseCode for code ${code}:`, {
        result,
        in_globalStore: globalDescriptionStore.metabaseCodes[code],
        in_cache: cachedMetabaseCodes[code],
        globalStore_keys: Object.keys(globalDescriptionStore.metabaseCodes).length,
        cache_keys: Object.keys(cachedMetabaseCodes).length,
      });
    }

    return result;
  }, []);

  // Get name from cache
  const getName = useCallback((code: number): string => {
    return globalDescriptionStore.names[code] || cachedNames[code] || '';
  }, []);

  // Request description safely with direct API loading when needed
  const requestDescription = useCallback(
    async (code: number): Promise<string> => {
      const description = globalDescriptionStore.descriptions[code] || cachedDescriptions[code];

      // If we already have the description, return immediately
      if (description) {
        return Promise.resolve(description);
      }

      // Descriptions are handled via SPARQL queries, not HTTP API calls

      // If we haven't requested it yet, mark it as requested
      if (!globalDescriptionStore.requestedCodes.has(code)) {
        globalDescriptionStore.requestDescription(code);
      }

      // Return the current value (which may be empty)
      return Promise.resolve(description || '');
    },
    [session]
  );

  // Check if description has been requested
  const isRequested = useCallback((code: number): boolean => {
    return globalDescriptionStore.requestedCodes.has(code);
  }, []);

  // Memoize contextValue to avoid unnecessary re-renders
  const contextValue = useMemo(() => {
    return {
      getName,
      getDescription,
      getWdCode,
      getMetabaseCode,
      requestDescription,
      isRequested,
      _addDescription: addDescription,
    };
  }, [
    getName,
    getDescription,
    getWdCode,
    getMetabaseCode,
    requestDescription,
    isRequested,
    addDescription,
  ]);

  return (
    <CapacityContext.Provider value={contextValue}>
      {/* Components that fetch descriptions in the background (without showing loading) */}
      {codesToFetch.map(code => (
        <DescriptionFetcher key={`desc-${code}`} code={code} language={language} />
      ))}

      {children}
    </CapacityContext.Provider>
  );
}

// Hook para usar o contexto
export function useCapacityDescriptions() {
  const context = useContext(CapacityContext);

  if (!context) {
    throw new Error(
      'useCapacityDescriptions deve ser usado dentro de um CapacityDescriptionProvider'
    );
  }

  return context;
}
