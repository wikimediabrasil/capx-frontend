import { QueryClient } from '@tanstack/react-query';

// Capacity data structure (matches existing CapacityCacheContext)
export interface CapacityData {
  code: number;
  name: string;
  description: string;
  wd_code: string;
  metabase_code: string;
  color: string;
  icon: string;
  hasChildren: boolean;
  level?: number;
  skill_type: number;
  skill_wikidata_item: string;
  parentCapacity?: any;
  category?: string;
  isFallbackTranslation?: boolean;
}

// Unified cache structure for capacity data
export interface UnifiedCache {
  capacities: Record<number, CapacityData>;
  children: Record<number, number[]>;
  language: string;
  timestamp: number;
}

// Capacity store state
export interface CapacityStoreState extends UnifiedCache {
  isLoadingTranslations: boolean;
}

// Capacity store actions
export interface CapacityStoreActions {
  // Getter methods
  getName: (code: number) => string;
  getDescription: (code: number) => string;
  getWdCode: (code: number) => string;
  getMetabaseCode: (code: number) => string;
  getColor: (code: number) => string;
  getIcon: (code: number) => string;
  getChildren: (parentCode: number) => CapacityData[];
  getCapacity: (code: number) => CapacityData | null;
  getRootCapacities: () => CapacityData[];
  hasChildren: (code: number) => boolean;
  isFallbackTranslation: (code: number) => boolean;

  // Computed state getters
  getIsLoaded: () => boolean;
  getIsDescriptionsReady: () => boolean;

  // Actions
  updateLanguage: (newLanguage: string, token: string) => Promise<void>;
  preloadCapacities: (token: string) => Promise<void>;
  clearCache: () => void;
  setCache: (cache: UnifiedCache) => void;

  // React Query integration
  invalidateQueryCache: (queryClient: QueryClient, language: string) => void;
}

// Combined capacity store type
export type CapacityStore = CapacityStoreState & CapacityStoreActions;

// App store state
export interface AppStoreState {
  isMobile: boolean;
  mobileMenuStatus: boolean;
  language: string;
  pageContent: Record<string, string>;
  session: any | null;
  mounted: boolean;
}

// App store actions
export interface AppStoreActions {
  setMobileMenuStatus: (status: boolean) => void;
  setLanguage: (language: string) => void;
  setPageContent: (content: Record<string, string>) => void;
  setSession: (session: any) => void;
  setIsMobile: (isMobile: boolean) => void;
  hydrate: () => () => void; // Returns cleanup function
}

// Combined app store type
export type AppStore = AppStoreState & AppStoreActions;
