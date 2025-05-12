import { useQuery, useQueryClient } from "@tanstack/react-query";
import { capacityService } from "@/services/capacityService";
import { Capacity, CapacityResponse } from "@/types/capacity";
import { useSession } from "next-auth/react";
import { getCapacityColor, getCapacityIcon } from "@/lib/utils/capacitiesUtils";
import { useState, useEffect, useCallback, useMemo } from "react";

// Chaves de cache para React Query
export const CAPACITY_CACHE_KEYS = {
  all: ["capacities"] as const,
  root: ["capacities", "root"] as const,
  byId: (id: number) => ["capacities", id.toString()] as const,
  byParent: (parentCode: string) =>
    [...CAPACITY_CACHE_KEYS.all, "byParent", parentCode] as const,
  search: (query: string) =>
    [...CAPACITY_CACHE_KEYS.all, "search", query] as const,
};

// Função auxiliar para converter CapacityResponse para Capacity
const convertToCapacity = (
  response: CapacityResponse,
  parentCode?: string
): Capacity => {
  const code =
    typeof response.code === "string" ? Number(response.code) : response.code;
  const baseCode = code.toString();
  const color = baseCode.startsWith("10")
    ? "organizational"
    : baseCode.startsWith("36")
    ? "communication"
    : baseCode.startsWith("50")
    ? "learning"
    : baseCode.startsWith("56")
    ? "community"
    : baseCode.startsWith("65")
    ? "social"
    : baseCode.startsWith("74")
    ? "strategic"
    : baseCode.startsWith("106")
    ? "technology"
    : "gray-200";

  return {
    code,
    name: response.name,
    color,
    icon: getCapacityIcon(baseCode),
    hasChildren: false, // Default, será atualizado se necessário
    skill_type: parentCode ? Number(parentCode) : code,
    skill_wikidata_item: "",
  };
};

// Interface para os valores retornados pelo hook
export interface CapacitiesHookResult {
  useAllCapacities: () => {
    data: Capacity[];
    isLoading: boolean;
  };
  useRootCapacities: () => {
    data: Capacity[];
    isLoading: boolean;
    isSuccess: boolean;
  };
  useCapacityById: (id: number) => {
    data: Capacity | null;
    isLoading: boolean;
    error: Error | null;
  };
  useCapacitiesByParent: (parentCode: string) => {
    data: Capacity[];
    isLoading: boolean;
    error: Error | null;
  };
  rootCapacities: Capacity[];
  allCapacities: Capacity[];
  isLoadingRootCapacities: boolean;
  getCapacityById: (id: number) => Capacity | undefined;
}

/**
 * Hook principal para acessar capacidades.
 * Refatorado para evitar chamadas de hooks dentro de funções.
 */
export function useCapacities(): CapacitiesHookResult {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const queryClient = useQueryClient();

  // Estados locais para evitar chamadas de hook dentro de funções retornadas
  const [allCapacities, setAllCapacities] = useState<Capacity[]>([]);
  const [rootCapacities, setRootCapacities] = useState<Capacity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar todas as capacidades
  const { data: rawCapacities, isLoading: isLoadingCapacities } = useQuery({
    queryKey: CAPACITY_CACHE_KEYS.all,
    queryFn: async () => {
      try {
        if (!token) return [];
        return await capacityService.fetchCapacities({
          headers: { Authorization: `Token ${token}` },
        });
      } catch (error) {
        console.error("Error fetching all capacities:", error);
        return [];
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Carregar capacidades raiz
  const { data: rawRootCapacities, isLoading: isLoadingRoots } = useQuery({
    queryKey: CAPACITY_CACHE_KEYS.root,
    queryFn: async () => {
      try {
        if (!token) return [];
        return await capacityService.fetchCapacities({
          headers: { Authorization: `Token ${token}` },
        });
      } catch (error) {
        console.error("Error fetching root capacities:", error);
        return [];
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Converter e processar dados crus quando disponíveis
  useEffect(() => {
    if (rawCapacities) {
      try {
        const convertedCapacities = rawCapacities.map((item) =>
          convertToCapacity(item)
        );
        setAllCapacities(convertedCapacities);
      } catch (error) {
        console.error("Error converting capacities:", error);
        setAllCapacities([]);
      }
    }
  }, [rawCapacities]);

  useEffect(() => {
    if (rawRootCapacities) {
      try {
        const convertedRoots = rawRootCapacities.map((item) =>
          convertToCapacity(item)
        );
        setRootCapacities(convertedRoots);
      } catch (error) {
        console.error("Error converting root capacities:", error);
        setRootCapacities([]);
      }
    }
  }, [rawRootCapacities]);

  // Atualizar estado de carregamento
  useEffect(() => {
    setIsLoading(isLoadingCapacities || isLoadingRoots);
  }, [isLoadingCapacities, isLoadingRoots]);

  // Função para buscar capacidade por ID - sem uso de hooks internos
  const getCapacityById = useCallback(
    (id: number): Capacity | undefined => {
      // Primeiro tenta encontrar nas capacidades raiz
      const rootResult = rootCapacities.find((cap) => cap.code === id);
      if (rootResult) return rootResult;

      // Depois tenta nas capacidades gerais
      const result = allCapacities.find((cap) => cap.code === id);
      if (result) return result;

      return undefined;
    },
    [rootCapacities, allCapacities]
  );

  // Criar hooks seguros que usam os dados cacheados
  const useAllCapacitiesData = () => {
    // Este hook usa os dados já processados
    return {
      data: allCapacities,
      isLoading,
    };
  };

  const useRootCapacitiesData = () => {
    // Este hook usa os dados já processados
    return {
      data: rootCapacities,
      isLoading,
      isSuccess: !isLoading && rootCapacities.length > 0,
    };
  };

  // Buscar capacidade por ID de forma segura
  const useCapacityByIdSafe = (id: number) => {
    return useQuery({
      queryKey: CAPACITY_CACHE_KEYS.byId(id),
      queryFn: async () => {
        if (!token) return null;
        try {
          const response = await capacityService.fetchCapacityById(
            id.toString()
          );
          return response ? convertToCapacity(response) : null;
        } catch (error) {
          console.error(`Error fetching capacity ${id}:`, error);
          return null;
        }
      },
      enabled: !!id && !!token,
      staleTime: 1000 * 60 * 60, // 1 hora
    });
  };

  // Função segura para buscar capacidades por parentCode
  const useCapacitiesByParentSafe = (parentCode: string) => {
    // Usar useMemo para garantir que não renderizamos hooks condicionalmente
    const rootCapacity = useMemo(() => {
      if (!parentCode) return null;
      return (
        rootCapacities.find((cap) => cap.code.toString() === parentCode) || null
      );
    }, [parentCode, rootCapacities]);

    return useQuery({
      queryKey: CAPACITY_CACHE_KEYS.byParent(parentCode),
      queryFn: async () => {
        if (!token || !parentCode) return [];
        if (!rootCapacity) return [];

        try {
          const childrenResponse = await capacityService.fetchCapacitiesByType(
            parentCode,
            { headers: { Authorization: `Token ${token}` } }
          );

          return Object.entries(childrenResponse).map(([code, name]) => {
            return {
              code: Number(code),
              name: name as unknown as string,
              color: rootCapacity.color,
              icon: rootCapacity.icon,
              hasChildren: false, // Simplificado para esta implementação
              skill_type: rootCapacity.code,
              skill_wikidata_item: "",
            } as Capacity;
          });
        } catch (error) {
          console.error(
            `Error fetching children for parent ${parentCode}:`,
            error
          );
          return [];
        }
      },
      enabled: !!parentCode && !!token && !!rootCapacity,
      staleTime: 1000 * 60 * 60, // 1 hora
    });
  };

  return {
    // Hooks seguros que não tem hooks internos
    useAllCapacities: useAllCapacitiesData,
    useRootCapacities: useRootCapacitiesData,
    useCapacityById: useCapacityByIdSafe,
    useCapacitiesByParent: useCapacitiesByParentSafe,

    // Estados diretamente acessíveis
    allCapacities,
    rootCapacities,
    isLoadingRootCapacities: isLoading,

    // Função segura para obter capacidade por ID
    getCapacityById,
  };
}
