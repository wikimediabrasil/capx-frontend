import { useApp } from '@/contexts/AppContext';
import { capacityService } from '@/services/capacityService';
import { CapacityResponse } from '@/types/capacity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CAPACITY_CACHE_KEYS } from './useCapacities';

// Hard-coded fallback names to ensure we always have something to display
const FALLBACK_NAMES = {
  '69': 'Strategic Thinking',
  '71': 'Team Leadership',
  '97': 'Project Management',
  '10': 'Organizational Skills',
  '36': 'Communication',
  '50': 'Learning',
  '56': 'Community Building',
  '65': 'Social Skills',
  '74': 'Strategic Planning',
  '106': 'Technology',
};

/**
 * Hook que traz detalhes de capacidades.
 * Completamente redesenhado para priorizar segurança e evitar erros.
 */
export function useCapacityDetails(capacityIds: any = [], language: string = 'en') {
  // Declaração segura para evitar erros em qualquer contexto
  const safeSession = useSession();
  const session = safeSession?.data;
  const safeAppContext = useApp();
  const pageContent = safeAppContext?.pageContent || {};
  const queryClient = useQueryClient();
  const token = session?.user?.token;

  // Armazenar nomes das capacidades
  const [capacityNames, setCapacityNames] = useState<Record<string, string>>({});
  const [capacityLoadingState, setCapacityLoadingState] = useState<Record<string, boolean>>({});

  // Garantir que capacityIds é sempre um array válido
  const safeCapacityIds = useMemo(() => {
    if (!capacityIds) return [];
    return Array.isArray(capacityIds)
      ? capacityIds.filter(id => id !== null && id !== undefined)
      : [];
  }, [capacityIds]);

  // Criar um conjunto único de IDs
  const uniqueIdSet = useMemo(() => {
    const uniqueIds = new Set<number>();

    if (!Array.isArray(safeCapacityIds)) return uniqueIds;

    safeCapacityIds.forEach(id => {
      let numId: number;
      if (typeof id === 'number') {
        numId = id;
      } else if (typeof id === 'string' && !isNaN(parseInt(id))) {
        numId = parseInt(id);
      } else {
        return; // Ignore invalid IDs
      }

      uniqueIds.add(numId);
    });

    return uniqueIds;
  }, [safeCapacityIds]);

  // Converter para array
  const uniqueCapacityIds = useMemo(() => {
    return Array.from(uniqueIdSet);
  }, [uniqueIdSet]);

  // Criar uma string estável para dependency tracking
  const capacityIdsKey = useMemo(() => {
    return uniqueCapacityIds.sort((a, b) => a - b).join(',');
  }, [uniqueCapacityIds]);

  // Usar uma única consulta para buscar todos os IDs
  const { data: capacityData, isLoading } = useQuery({
    queryKey: ['capacities', 'batch', capacityIdsKey, language],
    queryFn: async () => {
      if (!token || !uniqueCapacityIds.length) return {};

      const results: Record<string, string> = {};

      // Process in smaller chunks to avoid overwhelming the API
      const processIds = async (ids: number[]) => {
        await Promise.all(
          ids.map(async id => {
            try {
              // Check if already in React Query cache
              const existing = queryClient.getQueryData<CapacityResponse>(
                CAPACITY_CACHE_KEYS.byId(id, language)
              );

              if (existing?.name) {
                results[id.toString()] = existing.name;
                return;
              }

              // Fetch from API if not in cache
              const response = await capacityService.fetchCapacityById(id.toString(), {}, language);

              if (response && response.name) {
                // Check if name is a URL and replace with fallback if needed
                if (
                  typeof response.name === 'string' &&
                  (response.name.startsWith('https://') || response.name.includes('entity/Q'))
                ) {
                  results[id.toString()] =
                    FALLBACK_NAMES[id.toString() as keyof typeof FALLBACK_NAMES] ||
                    `Capacity ${id}`;
                } else {
                  results[id.toString()] = response.name;
                }

                // Update the React Query cache
                queryClient.setQueryData(CAPACITY_CACHE_KEYS.byId(id, language), response);
              } else {
                // Use fallback if available
                results[id.toString()] =
                  FALLBACK_NAMES[id.toString() as keyof typeof FALLBACK_NAMES] || `Capacity ${id}`;
              }
            } catch (error) {
              console.error(`Error fetching capacity ${id}:`, error);
              results[id.toString()] =
                FALLBACK_NAMES[id.toString() as keyof typeof FALLBACK_NAMES] || `Capacity ${id}`;
            }
          })
        );
      };

      // Process IDs in chunks of 10
      for (let i = 0; i < uniqueCapacityIds.length; i += 10) {
        const chunk = uniqueCapacityIds.slice(i, i + 10);
        await processIds(chunk);
      }

      return results;
    },
    enabled: !!token && uniqueCapacityIds.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes (increased from 5 minutes)
    gcTime: 1000 * 60 * 60 * 2, // 2 hours (increased from 1 hour)
    refetchOnWindowFocus: false, // Avoid refetching when window gains focus
    refetchOnMount: false, // Only fetch once per session
  });

  // Update local state when capacityData changes
  useEffect(() => {
    if (!capacityData) return;

    const newCapacityNames = { ...capacityNames };
    const newLoadingState = { ...capacityLoadingState };
    let hasChanges = false;

    Object.entries(capacityData).forEach(([id, name]) => {
      if (!newCapacityNames[id] || newCapacityNames[id] !== name) {
        newCapacityNames[id] = name;
        newLoadingState[id] = false;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setCapacityNames(newCapacityNames);
      setCapacityLoadingState(newLoadingState);
    }
  }, [capacityData, capacityNames, capacityLoadingState]);

  // Aplicar fallbacks para IDs que não foram encontrados
  useEffect(() => {
    if (!Array.isArray(safeCapacityIds) || safeCapacityIds.length === 0) return;

    const newCapacityNames = { ...capacityNames };
    const newCapacityLoadingState = { ...capacityLoadingState };
    let hasChanges = false;

    safeCapacityIds.forEach(id => {
      if (id === null || id === undefined) return;

      const idStr = id.toString();

      // Se não temos este ID no estado, adicione um fallback
      if (!newCapacityNames[idStr]) {
        newCapacityNames[idStr] =
          FALLBACK_NAMES[idStr as keyof typeof FALLBACK_NAMES] || `Capacity ${idStr}`;
        newCapacityLoadingState[idStr] = false;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setCapacityNames(newCapacityNames);
      setCapacityLoadingState(newCapacityLoadingState);
    }
  }, [safeCapacityIds, capacityNames, capacityLoadingState]);

  // Função auxiliar para obter o nome de uma capacidade
  const getCapacityName = useCallback(
    (capacity: any) => {
      try {
        // Early return for undefined/null values with a default message
        if (capacity === null || capacity === undefined) {
          return pageContent['capacity-unknown'] || 'Unknown Capacity';
        }

        let idStr: string;

        if (typeof capacity === 'object' && capacity && 'code' in capacity) {
          // Handle capacity objects with code property
          const code = capacity.code;
          if (code === null || code === undefined) {
            return pageContent['capacity-unknown'] || 'Unknown Capacity';
          }
          idStr = code.toString();
        } else if (typeof capacity === 'string' || typeof capacity === 'number') {
          // Handle direct ID values (string or number)
          idStr = capacity.toString();
        } else {
          // Fallback for any other unexpected type
          return pageContent['capacity-unknown'] || 'Unknown Capacity';
        }

        // Additional validation to prevent empty strings
        if (!idStr || !idStr.trim()) {
          return pageContent['capacity-unknown'] || 'Unknown Capacity';
        }

        // Check local cache first
        if (capacityNames[idStr]) {
          // Check if the name is a URL and replace it with fallback
          if (
            typeof capacityNames[idStr] === 'string' &&
            (capacityNames[idStr].startsWith('https://') ||
              capacityNames[idStr].includes('entity/Q'))
          ) {
            return FALLBACK_NAMES[idStr as keyof typeof FALLBACK_NAMES] || `Capacity ${idStr}`;
          }
          return capacityNames[idStr];
        }

        // Try fallback names
        if (FALLBACK_NAMES[idStr as keyof typeof FALLBACK_NAMES]) {
          return FALLBACK_NAMES[idStr as keyof typeof FALLBACK_NAMES];
        }

        // Final fallback
        return `Capacity ${idStr}`;
      } catch (error) {
        console.error('Error in getCapacityName:', error);
        return pageContent['capacity-error'] || 'Error loading capacity';
      }
    },
    [capacityNames, pageContent]
  );

  // Versão memoizada da função para evitar reconstrução em cada render
  const memoizedGetCapacityName = useMemo(() => getCapacityName, [getCapacityName]);

  return {
    capacityNames,
    capacityLoadingState,
    getCapacityName: memoizedGetCapacityName,
    isLoading,
  };
}

export function useCapacity(capacityId?: string | null, language: string = 'en') {
  const safeSession = useSession();
  const session = safeSession?.data;
  const safeAppContext = useApp();
  const safeLanguage = safeAppContext?.language || language;
  const token = session?.user?.token;

  const enabled = Boolean(capacityId && token);

  // Usar React Query para buscar e cachear a capacidade
  const {
    data: capacity,
    isLoading,
    error,
  } = useQuery({
    queryKey: capacityId
      ? [...CAPACITY_CACHE_KEYS.byId(Number(capacityId), safeLanguage), safeLanguage]
      : [],
    queryFn: async () => {
      if (!capacityId) return null;
      try {
        const data = await capacityService.fetchCapacityById(capacityId, {}, safeLanguage);
        return data;
      } catch (error) {
        console.error(`Error fetching capacity ${capacityId}:`, error);
        return null;
      }
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });

  return {
    capacity,
    isLoading,
    error,
  };
}
