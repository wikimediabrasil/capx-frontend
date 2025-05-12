import { useCallback, useEffect, useState, useMemo } from "react";
import { capacityService } from "@/services/capacityService";
import { useSession } from "next-auth/react";
import { Capacity, CapacityResponse } from "@/types/capacity";
import { useApp } from "@/contexts/AppContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CAPACITY_CACHE_KEYS } from "./useCapacities";

// Hard-coded fallback names to ensure we always have something to display
const FALLBACK_NAMES = {
  "69": "Strategic Thinking",
  "71": "Team Leadership",
  "97": "Project Management",
  "10": "Organizational Skills",
  "36": "Communication",
  "50": "Learning",
  "56": "Community Building",
  "65": "Social Skills",
  "74": "Strategic Planning",
  "106": "Technology",
};

/**
 * Hook que traz detalhes de capacidades.
 * Completamente redesenhado para priorizar segurança e evitar erros.
 */
export function useCapacityDetails(capacityIds: any = []) {
  // Declaração segura para evitar erros em qualquer contexto
  const safeSession = useSession();
  const session = safeSession?.data;
  const safeAppContext = useApp();
  const pageContent = safeAppContext?.pageContent || {};
  const queryClient = useQueryClient();
  const token = session?.user?.token;

  // Armazenar nomes das capacidades
  const [capacityNames, setCapacityNames] = useState<Record<string, string>>(
    {}
  );
  const [capacityLoadingState, setCapacityLoadingState] = useState<
    Record<string, boolean>
  >({});

  // Garantir que capacityIds é sempre um array válido
  // This is the critical protection against the length error
  const safeCapacityIds = useMemo(() => {
    return Array.isArray(capacityIds)
      ? capacityIds.filter((id) => id !== null && id !== undefined)
      : [];
  }, [capacityIds]);

  // Modificamos a lógica para não fazer chamadas diretas à API para cada ID
  useEffect(() => {
    // Pular se não houver token
    if (!token) return;

    // Referência para o timeout
    let timeoutId: NodeJS.Timeout | null = null;

    // Função que processa os IDs e busca capacidades
    const processCapacityIds = () => {
      // Cópia dos estados atuais para modificação
      const newCapacityNames: Record<string, string> = { ...capacityNames };
      const newCapacityLoadingState: Record<string, boolean> = {
        ...capacityLoadingState,
      };

      // Coletamos IDs que não estão em cache para buscar em lote
      const idsToFetch: number[] = [];

      // Processar cada ID de forma segura
      safeCapacityIds.forEach((id) => {
        try {
          if (id === null || id === undefined) return;

          // Try to convert to number, but handle errors
          let idNumber: number;
          let idStr: string;

          if (typeof id === "number") {
            idNumber = id;
            idStr = id.toString();
          } else if (typeof id === "string") {
            idNumber = parseInt(id, 10);
            idStr = id;
            if (isNaN(idNumber)) return;
          } else {
            // If it's neither a number nor a string, skip
            return;
          }

          // Consultar o cache primeiro
          const existingCapacity = queryClient.getQueryData<CapacityResponse>(
            CAPACITY_CACHE_KEYS.byId(idNumber)
          );

          if (existingCapacity?.name) {
            newCapacityNames[idStr] = existingCapacity.name;
            newCapacityLoadingState[idStr] = false;
          } else if (FALLBACK_NAMES[idStr as keyof typeof FALLBACK_NAMES]) {
            newCapacityNames[idStr] =
              FALLBACK_NAMES[idStr as keyof typeof FALLBACK_NAMES];
            newCapacityLoadingState[idStr] = false;
          } else {
            // Marca como carregando e adiciona à lista para buscar
            newCapacityNames[idStr] = `Capacity ${idStr}`;
            newCapacityLoadingState[idStr] = true;
            idsToFetch.push(idNumber);
          }
        } catch (error) {
          console.error("Error processing capacity ID:", error);
        }
      });

      // Atualizar os estados com os novos valores antes de buscar
      setCapacityNames((prev) => ({ ...prev, ...newCapacityNames }));
      setCapacityLoadingState((prev) => ({
        ...prev,
        ...newCapacityLoadingState,
      }));

      // Deduplicar e limitar o número de IDs a buscar para evitar sobrecarga
      const uniqueIdsToFetch = Array.from(new Set(idsToFetch)).slice(0, 10);

      if (uniqueIdsToFetch.length > 0) {
        // Define um novo timeout para buscar os IDs
        timeoutId = setTimeout(() => {
          // Para cada ID a buscar, use o React Query para cachear o resultado
          uniqueIdsToFetch.forEach((idNumber) => {
            const idStr = idNumber.toString();

            // Configura a query para este ID específico
            queryClient.prefetchQuery({
              queryKey: CAPACITY_CACHE_KEYS.byId(idNumber),
              queryFn: async () => {
                try {
                  const response = await capacityService.fetchCapacityById(
                    idStr
                  );

                  // Atualiza o nome quando a resposta chegar
                  if (response && response.name) {
                    setCapacityNames((prev) => ({
                      ...prev,
                      [idStr]: response.name,
                    }));
                  }

                  // Marca como carregado
                  setCapacityLoadingState((prev) => ({
                    ...prev,
                    [idStr]: false,
                  }));

                  return response;
                } catch (error) {
                  console.error(`Error fetching capacity ${idStr}:`, error);

                  // Marca como carregado mesmo com erro
                  setCapacityLoadingState((prev) => ({
                    ...prev,
                    [idStr]: false,
                  }));

                  return null;
                }
              },
              staleTime: 1000 * 60 * 5, // 5 minutos
            });
          });
        }, 300); // Adiciona um delay de 300ms para evitar chamadas excessivas
      }
    };

    // Chamar a função de processamento
    processCapacityIds();

    // Limpeza do timeout quando o componente desmontar
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    safeCapacityIds,
    token,
    queryClient,
    capacityNames,
    capacityLoadingState,
  ]);

  // Função auxiliar para obter o nome de uma capacidade
  const getCapacityName = useCallback(
    (capacity: any) => {
      try {
        // Early return for undefined/null values with a default message
        if (capacity === null || capacity === undefined) {
          return pageContent["capacity-unknown"] || "Unknown Capacity";
        }

        let idStr: string;

        if (typeof capacity === "object" && capacity && "code" in capacity) {
          // Handle capacity objects with code property
          const code = capacity.code;
          if (code === null || code === undefined) {
            return pageContent["capacity-unknown"] || "Unknown Capacity";
          }
          idStr = code.toString();
        } else if (
          typeof capacity === "string" ||
          typeof capacity === "number"
        ) {
          // Handle direct ID values (string or number)
          idStr = capacity.toString();
        } else {
          // Fallback for any other unexpected type
          return pageContent["capacity-unknown"] || "Unknown Capacity";
        }

        // Additional validation to prevent empty strings
        if (!idStr.trim()) {
          return pageContent["capacity-unknown"] || "Unknown Capacity";
        }

        // Check local cache first
        if (capacityNames[idStr]) {
          return capacityNames[idStr];
        }

        // Try fallback names
        if (FALLBACK_NAMES[idStr as keyof typeof FALLBACK_NAMES]) {
          return FALLBACK_NAMES[idStr as keyof typeof FALLBACK_NAMES];
        }

        // Final fallback
        return `Capacity ${idStr}`;
      } catch (error) {
        console.error("Error in getCapacityName:", error);
        return pageContent["capacity-error"] || "Error loading capacity";
      }
    },
    [capacityNames, pageContent]
  );

  return {
    capacityNames,
    capacityLoadingState,
    getCapacityName,
  };
}

export function useCapacity(capacityId?: string | null) {
  const safeSession = useSession();
  const session = safeSession?.data;
  const safeAppContext = useApp();
  const language = safeAppContext?.language || "en";
  const token = session?.user?.token;

  const enabled = Boolean(capacityId && token);

  // Usar React Query para buscar e cachear a capacidade
  const {
    data: capacity,
    isLoading,
    error,
  } = useQuery({
    queryKey: capacityId
      ? [...CAPACITY_CACHE_KEYS.byId(Number(capacityId)), language]
      : [],
    queryFn: async () => {
      if (!capacityId) return null;
      try {
        const data = await capacityService.fetchCapacityById(capacityId);
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
