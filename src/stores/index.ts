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
  ThemeStoreState,
  ThemeStoreActions,
  ThemeStore,
  ProfileEditStoreState,
  ProfileEditStoreActions,
  ProfileEditStore,
  BadgesStoreState,
  BadgesStoreActions,
  BadgesStore,
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
  useIsTablet,
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

// Theme Store
export { useThemeStore, useDarkMode, useSetDarkMode, useThemeMounted } from './themeStore';

// Profile Edit Store
export { useProfileEditStore, useUnsavedData } from './profileEditStore';

// Badges Store
export {
  useBadgesStore,
  useAllBadges,
  useUserBadges,
  useUserBadgesRelations,
  useBadgesLoading,
  useBadgesError,
} from './badgesStore';
