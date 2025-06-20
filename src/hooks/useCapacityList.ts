import { useState, useCallback, useRef, useEffect } from "react";
import { capacityService } from "@/services/capacityService";
import {
  getCapacityColor,
  getCapacityIcon,
  sanitizeCapacityName,
} from "@/lib/utils/capacitiesUtils";
import { CapacityResponse, Capacity } from "@/types/capacity";

// Cache global para compartilhar dados entre instâncias do hook
interface GlobalCache {
  rootCapacities: Capacity[];
  childrenCapacities: Record<string, Capacity[]>;
  descriptions: Record<string, string>;
  wdCodes: Record<string, string>;
  fetchedParents: Set<string>;
  pendingRequests: Record<string, Promise<any>>;
}

// Inicializar o cache global
const globalCache: GlobalCache = {
  rootCapacities: [],
  childrenCapacities: {},
  descriptions: {},
  wdCodes: {},
  fetchedParents: new Set<string>(),
  pendingRequests: {},
};

export function useCapacityList(token?: string, language: string = "en") {
  const [rootCapacities, setRootCapacities] = useState<Capacity[]>(
    globalCache.rootCapacities
  );
  const [childrenCapacities, setChildrenCapacities] = useState<
    Record<string, Capacity[]>
  >(globalCache.childrenCapacities);
  const [descriptions, setDescriptions] = useState<Record<string, string>>(
    globalCache.descriptions
  );
  const [capacityById, setCapacityById] = useState<CapacityResponse>();
  const [wdCodes, setWdCodes] = useState<Record<string, string>>(
    globalCache.wdCodes
  );
  const [searchResults, setSearchResults] = useState<Capacity[]>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Referência para controlar se o hook já foi inicializado
  const initialized = useRef(false);

  const fetchRootCapacities = useCallback(async () => {
    if (!token) return;

    // Se já temos as capacidades raiz no cache global e não estamos carregando, retornar imediatamente
    if (globalCache.rootCapacities.length > 0) {
      setRootCapacities(globalCache.rootCapacities);
      return;
    }

    // Verificar se já existe uma requisição em andamento
    if (
      Object.prototype.hasOwnProperty.call(globalCache.pendingRequests, "root")
    ) {
      await globalCache.pendingRequests["root"];
      setRootCapacities(globalCache.rootCapacities);
      return;
    }

    setIsLoading((prev) => ({ ...prev, root: true }));

    // Criar uma promessa para a requisição atual
    const requestPromise = (async () => {
      try {
        const response = await capacityService.fetchCapacities({
          params: { language },
          headers: { Authorization: `Token ${token}` },
        });

        const formattedCapacities = response.map((item: any): Capacity => {
          const baseCode = item.code.toString();
          return {
            wd_code: item.wd_code,
            code: baseCode,
            name: item.name,
            color: baseCode.startsWith("10")
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
              : "gray-200",
            icon: getCapacityIcon(baseCode),
            hasChildren: true,
            skill_type: Number(baseCode),
            skill_wikidata_item: "",
          };
        });

        // Atualizar o cache global
        globalCache.rootCapacities = formattedCapacities;

        setRootCapacities(formattedCapacities);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch root capacities"
        );
      } finally {
        setIsLoading((prev) => ({ ...prev, root: false }));
        // Limpar a promessa pendente
        delete globalCache.pendingRequests["root"];
      }
    })();

    // Armazenar a promessa no cache de requisições pendentes
    globalCache.pendingRequests["root"] = requestPromise;

    await requestPromise;
  }, [token, language]);

  const fetchCapacitiesByParent = useCallback(
    async (parentCode: string) => {
      if (!token) return [];

      // Verificar se os filhos já estão no cache global
      if (globalCache.childrenCapacities[parentCode]) {
        // Atualizar o estado local a partir do cache global
        setChildrenCapacities((prev) => ({
          ...prev,
          [parentCode]: globalCache.childrenCapacities[parentCode],
        }));

        // Retornar os dados do cache
        return globalCache.childrenCapacities[parentCode];
      }

      // Verificar se já existe uma requisição em andamento para este parentCode
      const requestKey = `parent_${parentCode}`;
      if (
        Object.prototype.hasOwnProperty.call(
          globalCache.pendingRequests,
          requestKey
        )
      ) {
        // Esperar a requisição pendente completar
        await globalCache.pendingRequests[requestKey];

        // Retornar os dados do cache após a conclusão da requisição
        return globalCache.childrenCapacities[parentCode] || [];
      }

      // Marcar o parent como carregando
      setIsLoading((prev) => ({ ...prev, [parentCode]: true }));

      // Criar uma promessa para a requisição atual
      const requestPromise = (async () => {
        try {
          const response = await capacityService.fetchCapacitiesByType(
            parentCode,
            {
              headers: { Authorization: `Token ${token}` },
            }
          );

          const capacityData = await Promise.all(
            Object.entries(response).map(async ([code, name]) => {
              // Verificar se já temos os filhos desta capacidade no cache
              if (!globalCache.childrenCapacities[code]) {
                const childrenResponse =
                  await capacityService.fetchCapacitiesByType(code, {
                    headers: { Authorization: `Token ${token}` },
                  });

                // Marcar que já buscamos os filhos deste código
                globalCache.fetchedParents.add(code);

                return {
                  code,
                  name,
                  hasChildren: Object.keys(childrenResponse).length > 0,
                };
              }

              // Se já temos os filhos no cache, determinar se tem filhos baseado na cache
              return {
                code,
                name,
                hasChildren:
                  globalCache.childrenCapacities[code]?.length > 0 || false,
              };
            })
          );

          const parentCapacity =
            globalCache.rootCapacities.length > 0
              ? globalCache.rootCapacities.find(
                  (cap) => cap.code.toString() === parentCode.toString()
                )
              : rootCapacities.find(
                  (cap) => cap.code.toString() === parentCode.toString()
                );

          const formattedCapacities = capacityData.map(
            (item: any): Capacity => {
              const baseCode = item.code.toString();
              return {
                code: baseCode,
                wd_code: item.wd_code,
                name: item.name,
                color: getCapacityColor(parentCapacity?.color || "gray-200"),
                icon: getCapacityIcon(Number(parentCode)),
                hasChildren: item.hasChildren,
                skill_type: Number(parentCode),
                skill_wikidata_item: "",
              };
            }
          );

          // Atualizar o cache global
          globalCache.childrenCapacities[parentCode] = formattedCapacities;

          // Atualizar o estado local
          setChildrenCapacities((prev) => ({
            ...prev,
            [parentCode]: formattedCapacities,
          }));

          return formattedCapacities;
        } catch (error) {
          console.error("Failed to fetch capacities by parent:", error);
          throw error;
        } finally {
          setIsLoading((prev) => ({ ...prev, [parentCode]: false }));
          // Limpar a promessa pendente
          delete globalCache.pendingRequests[requestKey];
        }
      })();

      // Armazenar a promessa no cache de requisições pendentes
      globalCache.pendingRequests[requestKey] = requestPromise;

      return await requestPromise;
    },
    [token, rootCapacities]
  );

  const fetchCapacityDescription = useCallback(
    async (code: number) => {
      if (!token) return;

      const codeStr = code.toString();

      // Verificar se a descrição já está no cache global
      if (globalCache.descriptions[codeStr]) {
        // Atualizar o estado local a partir do cache global
        setDescriptions((prev) => ({
          ...prev,
          [codeStr]: globalCache.descriptions[codeStr],
        }));

        setWdCodes((prev) => ({
          ...prev,
          [codeStr]: globalCache.wdCodes[codeStr],
        }));

        return globalCache.descriptions[codeStr];
      }

      // Verificar se já existe uma requisição em andamento para esta descrição
      const requestKey = `desc_${codeStr}`;
      if (
        Object.prototype.hasOwnProperty.call(
          globalCache.pendingRequests,
          requestKey
        )
      ) {
        // Esperar a requisição pendente completar
        await globalCache.pendingRequests[requestKey];

        // Retornar os dados do cache após a conclusão da requisição
        return globalCache.descriptions[codeStr] || "";
      }

      // Criar uma promessa para a requisição atual
      const requestPromise = (async () => {
        try {
          const response = await capacityService.fetchCapacityDescription(
            code,
            {
              params: { language },
              headers: { Authorization: `Token ${token}` },
            }
          );

          // Atualizar o cache global
          globalCache.descriptions[codeStr] = response.description;
          globalCache.wdCodes[codeStr] = response.wdCode;

          // Atualizar o estado local
          setDescriptions((prev) => ({
            ...prev,
            [codeStr]: response.description,
          }));

          setWdCodes((prev) => ({
            ...prev,
            [codeStr]: response.wdCode,
          }));

          return response.description;
        } catch (error) {
          console.error("Failed to fetch capacity description:", error);
          return "";
        } finally {
          // Limpar a promessa pendente
          delete globalCache.pendingRequests[requestKey];
        }
      })();

      // Armazenar a promessa no cache de requisições pendentes
      globalCache.pendingRequests[requestKey] = requestPromise;

      return await requestPromise;
    },
    [token, language]
  );

  const fetchCapacityById = useCallback(
    async (id: string) => {
      if (!token) return;

      try {
        const response = await capacityService.fetchCapacityById(id);

        setCapacityById(response);
      } catch (error) {
        console.error("Failed to fetch capacity by id:", error);
      }
    },
    [token, language]
  );

  // Inicializar o hook - carregar capacidades raiz apenas uma vez quando o token estiver disponível
  useEffect(() => {
    if (token && !initialized.current) {
      fetchRootCapacities();
      initialized.current = true;
    }
  }, [token, fetchRootCapacities]);

  const findParentCapacity = useCallback(
    (
      childCapacity: Capacity | { code: string | number; skill_type?: number }
    ) => {
      const childCode = childCapacity.code.toString();
      const parentCode =
        (childCapacity as Capacity).skill_type?.toString() ||
        (childCapacity as { skill_type?: number }).skill_type?.toString();

      if (parentCode) {
        // Check if parent is a root capacity
        const parent = rootCapacities.find(
          (root) => root.code.toString() === parentCode
        );

        if (parent) {
          return parent;
        }

        // Check if parent is in children capacities
        for (const rootCode in childrenCapacities) {
          const children = childrenCapacities[rootCode] || [];
          const parent = children.find(
            (child) => child.code.toString() === parentCode
          );

          if (parent) {
            const grandparent = rootCapacities.find(
              (root) => root.code.toString() === rootCode
            );

            if (grandparent) {
              return {
                ...parent,
                parentCapacity: grandparent,
                color: parent.color || grandparent.color,
                icon: parent.icon || grandparent.icon,
              };
            }
          }

          return parent;
        }
      }

      for (const rootCode in childrenCapacities) {
        const children = childrenCapacities[rootCode] || [];
        for (const child of children) {
          const grandChildren = childrenCapacities[child.code.toString()] || [];

          const grandChild = grandChildren.find(
            (gc) => gc.code.toString() === childCode
          );

          if (grandChild) {
            const grandparent = rootCapacities.find(
              (root) => root.code.toString() === rootCode
            );

            if (grandparent) {
              return {
                ...child,
                parentCapacity: grandparent,
                color: grandparent.color,
                icon: grandparent.icon,
              };
            }
          }
        }
      }

      return undefined;
    },
    [rootCapacities, childrenCapacities]
  );

  const fetchCapacitySearch = useCallback(
    async (search: string) => {
      if (!token) return;

      try {
        const response = await capacityService.searchCapacities(search, {
          params: { language },
          headers: { Authorization: `Token ${token}` },
        });

        const validResults = response.filter((item: any) => item !== null);

        // first, process all results to identify root, child and grandchild capacities
        const processedResults = await Promise.all(
          validResults.map(async (item: any) => {
            const isRootCapacity = rootCapacities.some(
              (root) => root.code.toString() === item.code.toString()
            );

            // if it is a root capacity, use its own information
            if (isRootCapacity) {
              const rootCapacity = rootCapacities.find(
                (root) => root.code.toString() === item.code.toString()
              );

              return {
                code: item.code,
                name: sanitizeCapacityName(item.name, item.code),
                color: rootCapacity?.color || item.color,
                icon: rootCapacity?.icon || item.icon,
                hasChildren: true,
                wd_code: item.wd_code,
                parentCapacity: undefined,
                skill_type: Number(item.code),
                skill_wikidata_item: item.skill_wikidata_item || "",
                level: 1, // Explicitly set level for root capacities
              };
            }

            // check if it is a direct child capacity
            const parentId = item.skill_type;
            if (parentId) {
              // check if the parentId is a root capacity
              const rootParent = rootCapacities.find(
                (root) => root.code.toString() === parentId.toString()
              );

              if (rootParent) {
                // it is a direct child capacity
                return {
                  code: item.code,
                  name: sanitizeCapacityName(item.name, item.code),
                  color: rootParent.color,
                  icon: rootParent.icon,
                  hasChildren: false,
                  parentCapacity: rootParent,
                  skill_type: Number(item.skill_type) || 0,
                  skill_wikidata_item: item.skill_wikidata_item || "",
                  level: 2, // Explicitly set level for second-level capacities
                };
              }

              // if the parentId is not a root capacity, then it is a grandchild capacity
              // search for the parent capacity in the children capacities
              for (const rootCode in childrenCapacities) {
                const children = childrenCapacities[rootCode] || [];
                const parent = children.find(
                  (child) => child.code.toString() === parentId.toString()
                );

                if (parent) {
                  // found the parent, now find the grandparent
                  const grandparent = rootCapacities.find(
                    (root) => root.code.toString() === rootCode
                  );

                  if (grandparent) {
                    // it is a grandchild capacity
                    return {
                      code: item.code,
                      name: sanitizeCapacityName(item.name, item.code),
                      color: "black", // Always use black for third-level capacities
                      icon: grandparent.icon,
                      wd_code: item.wd_code,
                      hasChildren: false,
                      metabase_code: "",
                      level: 3, // Always explicitly set level for third-level capacities
                      parentCapacity: {
                        ...parent,
                        parentCapacity: grandparent,
                      },
                      skill_type: Number(item.skill_type) || 0,
                      skill_wikidata_item: item.skill_wikidata_item || "",
                    };
                  }
                }
              }

              // if didnt find the parent, create a fake parent
              return {
                code: item.code,
                wd_code: item.wd_code,
                name: sanitizeCapacityName(item.name, item.code),
                color: "black", // Always use black for unknown child capacities
                icon: "",
                hasChildren: false,
                level: 3, // Assume it's a third-level if we can't determine hierarchy
                parentCapacity: {
                  code: Number(parentId),
                  name: `Capacity ${parentId}`,
                  color: "gray-200",
                  icon: "",
                  skill_type: 0,
                  skill_wikidata_item: "",
                  hasChildren: false,
                  metabase_code: "",
                  parentCapacity: {
                    code: 0,
                    name: "Root",
                    color: "gray-200",
                    icon: "",
                    skill_type: 0,
                    skill_wikidata_item: "",
                    hasChildren: false,
                  },
                },
                skill_type: Number(item.skill_type) || 0,
                skill_wikidata_item: item.skill_wikidata_item || "",
              };
            }

            // fallback for any other case
            return {
              code: item.code,
              wd_code: item.wd_code,
              name: sanitizeCapacityName(item.name, item.code),
              color: "gray-600", // dark gray for unknown capacities
              icon: "",
              hasChildren: false,
              parentCapacity: undefined,
              skill_type: Number(item.skill_type) || 0,
              skill_wikidata_item: item.skill_wikidata_item || "",
              level: 1, // Default level if we can't determine hierarchy
            };
          })
        );

        setSearchResults(processedResults);
      } catch (error) {
        console.error("Failed to fetch capacity search:", error);
      }
    },
    [token, language, rootCapacities, childrenCapacities]
  );

  return {
    rootCapacities,
    childrenCapacities,
    descriptions,
    searchResults,
    setSearchResults,
    capacityById,
    wdCodes,
    isLoading,
    error,
    findParentCapacity,
    fetchRootCapacities,
    fetchCapacitiesByParent,
    fetchCapacityDescription,
    fetchCapacityById,
    fetchCapacitySearch,
  };
}
