import { Capacity } from '@/types/capacity';
import { useCallback, useMemo } from 'react';

// Types for different use cases
export interface FilterCapacitySelectionConfig {
  type: 'filter';
  currentCapacities: Array<{ code: number; name: string }>;
  onUpdate: (capacities: Array<{ code: number; name: string }>) => void;
  onModalClose?: () => void;
}

export interface FormCapacitySelectionConfig {
  type: 'form';
  currentCapacities: number[];
  onUpdate: (capacities: number[]) => void;
  onModalClose?: () => void;
  sanitizeCode?: (code: number | string) => number;
}

export interface ProfileFormCapacitySelectionConfig {
  type: 'profile-form';
  capacityType: 'known' | 'available' | 'wanted';
  currentFormData: any;
  onUpdate: (newFormData: any) => void;
  onModalClose?: () => void;
  addUniqueCapacity: (array: number[], id: number) => number[];
  ensureArray: <T>(value: T[] | undefined) => T[];
}

export interface EventFormCapacitySelectionConfig {
  type: 'event-form';
  currentCapacities: Capacity[];
  onUpdate: (capacities: Capacity[]) => void;
  onEventChange: (index: number, field: string, value: string) => void;
  eventIndex: number;
  onModalClose?: () => void;
}

export type CapacitySelectionConfig =
  | FilterCapacitySelectionConfig
  | FormCapacitySelectionConfig
  | ProfileFormCapacitySelectionConfig
  | EventFormCapacitySelectionConfig;

/**
 * Hook for managing capacity selection centrally
 * Supports different use cases: filters, forms, profiles, events
 */
export function useCapacitySelection(config: CapacitySelectionConfig) {
  // Extract stable references from config to avoid recreating callback
  const { type } = config;

  const handleCapacitySelect = useCallback(
    (capacities: Capacity[]) => {
      switch (type) {
        case 'filter': {
          const filterConfig = config as FilterCapacitySelectionConfig;
          const newCapacities = [...filterConfig.currentCapacities];

          capacities.forEach(capacity => {
            const capacityExists = newCapacities.some(cap => cap.code === capacity.code);

            if (!capacityExists) {
              newCapacities.push({
                name: capacity.name,
                code: capacity.code,
              });
            }
          });

          filterConfig.onUpdate(newCapacities);
          if (filterConfig.onModalClose) {
            filterConfig.onModalClose();
          }
          break;
        }

        case 'form': {
          const formConfig = config as FormCapacitySelectionConfig;
          let updatedCapacities = [...formConfig.currentCapacities];

          capacities.forEach(capacity => {
            const sanitizedCode = formConfig.sanitizeCode
              ? formConfig.sanitizeCode(capacity.code)
              : Number(capacity.code);

            if (sanitizedCode && !updatedCapacities.includes(sanitizedCode)) {
              updatedCapacities.push(sanitizedCode);
            }
          });

          formConfig.onUpdate(updatedCapacities);
          if (formConfig.onModalClose) {
            formConfig.onModalClose();
          }
          break;
        }

        case 'profile-form': {
          const profileConfig = config as ProfileFormCapacitySelectionConfig;
          const newFormData = { ...profileConfig.currentFormData };

          capacities.forEach(capacity => {
            const capacityId = Number(capacity.code);

            switch (profileConfig.capacityType) {
              case 'known':
                newFormData.skills_known = profileConfig.addUniqueCapacity(
                  profileConfig.ensureArray(newFormData.skills_known),
                  capacityId
                );
                break;
              case 'available':
                newFormData.skills_available = profileConfig.addUniqueCapacity(
                  profileConfig.ensureArray(newFormData.skills_available),
                  capacityId
                );
                break;
              case 'wanted':
                newFormData.skills_wanted = profileConfig.addUniqueCapacity(
                  profileConfig.ensureArray(newFormData.skills_wanted),
                  capacityId
                );
                break;
            }
          });

          profileConfig.onUpdate(newFormData);
          if (profileConfig.onModalClose) {
            profileConfig.onModalClose();
          }
          break;
        }

        case 'event-form': {
          const eventConfig = config as EventFormCapacitySelectionConfig;
          let newCapacities = [...eventConfig.currentCapacities];

          capacities.forEach(capacity => {
            if (!newCapacities.find(cap => cap.code === capacity.code)) {
              newCapacities.push(capacity);
            }
          });

          eventConfig.onUpdate(newCapacities);

          // Update related_skills in event (only the IDs)
          const skillIds = newCapacities.map(cap => cap.code);
          eventConfig.onEventChange(
            eventConfig.eventIndex,
            'related_skills',
            JSON.stringify(skillIds)
          );

          if (eventConfig.onModalClose) {
            eventConfig.onModalClose();
          }
          break;
        }
      }
    },
    [config, type]
  );

  return {
    handleCapacitySelect,
  };
}

export function useFilterCapacitySelection(
  currentCapacities: Array<{ code: number; name: string }>,
  onUpdate: (capacities: Array<{ code: number; name: string }>) => void,
  onModalClose?: () => void
) {
  const config = useMemo(
    () => ({
      type: 'filter' as const,
      currentCapacities,
      onUpdate,
      onModalClose,
    }),
    [currentCapacities, onUpdate, onModalClose]
  );

  return useCapacitySelection(config);
}

export function useFormCapacitySelection(
  currentCapacities: number[],
  onUpdate: (capacities: number[]) => void,
  onModalClose?: () => void,
  sanitizeCode?: (code: number | string) => number
) {
  const config = useMemo(
    () => ({
      type: 'form' as const,
      currentCapacities,
      onUpdate,
      onModalClose,
      sanitizeCode,
    }),
    [currentCapacities, onUpdate, onModalClose]
  );

  return useCapacitySelection(config);
}

export function useProfileFormCapacitySelection(
  capacityType: 'known' | 'available' | 'wanted',
  currentFormData: any,
  onUpdate: (newFormData: any) => void,
  addUniqueCapacity: (array: number[], id: number) => number[],
  ensureArray: <T>(value: T[] | undefined) => T[],
  onModalClose?: () => void
) {
  const config = useMemo(
    () => ({
      type: 'profile-form' as const,
      capacityType,
      currentFormData,
      onUpdate,
      onModalClose,
      addUniqueCapacity,
      ensureArray,
    }),
    [capacityType, currentFormData, onUpdate, onModalClose]
  );

  return useCapacitySelection(config);
}

export function useEventFormCapacitySelection(
  currentCapacities: Capacity[],
  onUpdate: (capacities: Capacity[]) => void,
  onEventChange: (index: number, field: string, value: string) => void,
  eventIndex: number,
  onModalClose?: () => void
) {
  const config = useMemo(
    () => ({
      type: 'event-form' as const,
      currentCapacities,
      onUpdate,
      onEventChange,
      eventIndex,
      onModalClose,
    }),
    [currentCapacities, onUpdate, onEventChange, eventIndex, onModalClose]
  );

  return useCapacitySelection(config);
}
