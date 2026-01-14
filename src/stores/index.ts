// Zustand stores for state management
// These stores replace React Context for better performance via selective subscriptions

// Types
export type {
  CapacityData,
  UnifiedCache,
  CapacityStoreState,
  CapacityStoreActions,
  CapacityStore,
  AppStoreState,
  AppStoreActions,
  AppStore,
} from './types';

// Capacity Store
export {
  useCapacityStore,
  useCapacityLanguage,
  useCapacityIsLoading,
  useCapacities,
  useCapacityChildren,
} from './capacityStore';

// App Store
export {
  useAppStore,
  useIsMobile,
  useLanguage,
  useMobileMenuStatus,
  usePageContent,
  useSession,
  useMounted,
} from './appStore';

// Capacity Selector Hooks
export {
  useCapacityName,
  useCapacityDescription,
  useCapacityColor,
  useCapacityIcon,
  useCapacity,
  useCapacityChildrenOf,
  useRootCapacities,
  useHasChildren,
  useIsFallbackTranslation,
  useIsCapacitiesLoaded,
  useIsDescriptionsReady,
  useIsLoadingTranslations,
  useCacheLanguage,
  useCapacityCardData,
} from './hooks/useCapacitySelectors';

// App Selector Hooks
export {
  useIsMobileView,
  useMobileMenu,
  useCurrentLanguage,
  useTranslations,
  useTranslation,
  useSessionData,
  useIsMounted,
  useNavigationState,
  useLanguageState,
} from './hooks/useAppSelectors';
