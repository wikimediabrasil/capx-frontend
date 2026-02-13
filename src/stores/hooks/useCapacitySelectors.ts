'use client';

import { useCapacityStore } from '../capacityStore';
import { CapacityData } from '../types';

/**
 * Selector hooks for capacity store
 * These provide optimized subscriptions - components only re-render when their specific data changes
 */

// Get a specific capacity's name
export const useCapacityName = (code: number): string => {
  return useCapacityStore(state => state.getName(code));
};

// Get a specific capacity's description
export const useCapacityDescription = (code: number): string => {
  return useCapacityStore(state => state.getDescription(code));
};

// Get a specific capacity's color
export const useCapacityColor = (code: number): string => {
  return useCapacityStore(state => state.getColor(code));
};

// Get a specific capacity's icon
export const useCapacityIcon = (code: number): string => {
  return useCapacityStore(state => state.getIcon(code));
};

// Get a specific capacity
export const useCapacity = (code: number): CapacityData | null => {
  return useCapacityStore(state => state.getCapacity(code));
};

// Get children of a capacity
export const useCapacityChildrenOf = (parentCode: number): CapacityData[] => {
  return useCapacityStore(state => state.getChildren(parentCode));
};

// Get root capacities
export const useRootCapacities = (): CapacityData[] => {
  return useCapacityStore(state => state.getRootCapacities());
};

// Check if capacity has children
export const useHasChildren = (code: number): boolean => {
  return useCapacityStore(state => state.hasChildren(code));
};

// Check if using fallback translation
export const useIsFallbackTranslation = (code: number): boolean => {
  return useCapacityStore(state => state.isFallbackTranslation(code));
};

// Check if capacities are loaded
export const useIsCapacitiesLoaded = (): boolean => {
  return useCapacityStore(state => state.getIsLoaded());
};

// Check if descriptions are ready
export const useIsDescriptionsReady = (): boolean => {
  return useCapacityStore(state => state.getIsDescriptionsReady());
};

// Get loading state
export const useIsLoadingTranslations = (): boolean => {
  return useCapacityStore(state => state.isLoadingTranslations);
};

// Get current cache language
export const useCacheLanguage = (): string => {
  return useCapacityStore(state => state.language);
};

// Combined hook for capacity card display
export const useCapacityCardData = (code: number) => {
  const store = useCapacityStore();
  return {
    name: store.getName(code),
    description: store.getDescription(code),
    color: store.getColor(code),
    icon: store.getIcon(code),
    hasChildren: store.hasChildren(code),
    isFallback: store.isFallbackTranslation(code),
  };
};
