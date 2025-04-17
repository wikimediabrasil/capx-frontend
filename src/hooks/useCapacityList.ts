import { useState, useCallback } from "react";
import { capacityService } from "@/services/capacityService";
import { getCapacityColor, getCapacityIcon } from "@/lib/utils/capacitiesUtils";
import { CapacityResponse, Capacity } from "@/types/capacity";

export function useCapacityList(token?: string, language: string = "en") {
  const [rootCapacities, setRootCapacities] = useState<Capacity[]>([]);
  const [childrenCapacities, setChildrenCapacities] = useState<
    Record<string, Capacity[]>
  >({});
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [capacityById, setCapacityById] = useState<CapacityResponse>();
  const [wdCodes, setWdCodes] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<Capacity[]>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchRootCapacities = useCallback(async () => {
    if (!token) return;

    setIsLoading((prev) => ({ ...prev, root: true }));
    try {
      const response = await capacityService.fetchCapacities({
        params: { language },
        headers: { Authorization: `Token ${token}` },
      });

      const formattedCapacities = response.map((item: any): Capacity => {
        const baseCode = item.code.toString();
        return {
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

      setRootCapacities(formattedCapacities);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch root capacities"
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, root: false }));
    }
  }, [token, language]);

  const fetchCapacitiesByParent = useCallback(
    async (parentCode: string) => {
      if (!token) return [];

      try {
        const response = await capacityService.fetchCapacitiesByType(
          parentCode,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );

        const capacityData = await Promise.all(
          Object.entries(response).map(async ([code, name]) => {
            const childrenResponse =
              await capacityService.fetchCapacitiesByType(code, {
                headers: { Authorization: `Token ${token}` },
              });

            return {
              code,
              name,
              hasChildren: Object.keys(childrenResponse).length > 0,
            };
          })
        );

        const parentCapacity = rootCapacities.find(
          (cap) => cap.code.toString() === parentCode.toString()
        );

        const formattedCapacities = capacityData.map((item: any): Capacity => {
          const baseCode = item.code.toString();
          return {
            code: baseCode,
            name: item.name,
            color: getCapacityColor(parentCapacity?.color || "gray-200"),
            icon: getCapacityIcon(Number(parentCode)),
            hasChildren: item.hasChildren,
            skill_type: Number(parentCode),
            skill_wikidata_item: "",
          };
        });

        setChildrenCapacities((prev) => ({
          ...prev,
          [parentCode]: formattedCapacities,
        }));
        return formattedCapacities;
      } catch (error) {
        console.error("Failed to fetch capacities by parent:", error);
        throw error;
      }
    },
    [token, language, rootCapacities]
  );

  const fetchCapacityDescription = useCallback(
    async (code: number) => {
      if (!token) return;

      try {
        const response = await capacityService.fetchCapacityDescription(code, {
          params: { language },
          headers: { Authorization: `Token ${token}` },
        });

        setDescriptions((prev) => ({ ...prev, [code]: response.description }));
        setWdCodes((prev) => ({ ...prev, [code]: response.wdCode }));

        return response.description;
      } catch (error) {
        console.error("Failed to fetch capacity description:", error);
      }
    },
    [token, language]
  );

  const fetchCapacityById = useCallback(
    async (id: string) => {
      if (!token) return;

      try {
        const response = await capacityService.fetchCapacityById(id, {
          params: { language },
          headers: { Authorization: `Token ${token}` },
        });

        setCapacityById(response);
      } catch (error) {
        console.error("Failed to fetch capacity by id:", error);
      }
    },
    [token, language]
  );

  const findParentCapacity = useCallback(
    (
      childCapacity: Capacity | { code: string | number; skill_type?: number }
    ) => {
      const childCode = childCapacity.code.toString();
      const skillType = childCapacity.skill_type;

      // if doesnt have skill_type, return undefined
      if (!skillType) {
        return undefined;
      }

      // first, check if it is a direct child capacity
      const parentId = skillType.toString();

      // search for the parent capacity in the root capacities
      const rootParent = rootCapacities.find(
        (root) => root.code.toString() === parentId
      );

      if (rootParent) {
        return rootParent;
      }
      // if it is not a direct child capacity, check if it is a grandchild capacity
      // first, find the parent capacity
      for (const rootCode in childrenCapacities) {
        const children = childrenCapacities[rootCode] || [];

        const parent = children.find(
          (child) => child.code.toString() === parentId
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
                name: item.name,
                color: rootCapacity?.color || item.color,
                icon: rootCapacity?.icon || item.icon,
                hasChildren: true,
                parentCapacity: undefined,
                skill_type: Number(item.code),
                skill_wikidata_item: item.skill_wikidata_item || "",
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
                  name: item.name,
                  color: rootParent.color,
                  icon: rootParent.icon,
                  hasChildren: false,
                  parentCapacity: rootParent,
                  skill_type: Number(item.skill_type) || 0,
                  skill_wikidata_item: item.skill_wikidata_item || "",
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
                      name: item.name,
                      color: parent.color || grandparent.color || "gray-600",
                      icon: grandparent.icon,
                      hasChildren: false,
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
                name: item.name,
                color: "gray-600", // dark gray for grandchild capacities
                icon: "",
                hasChildren: false,
                parentCapacity: {
                  code: Number(parentId),
                  name: `Capacity ${parentId}`,
                  color: "gray-600",
                  icon: "",
                  skill_type: 0,
                  skill_wikidata_item: "",
                  hasChildren: false,
                  parentCapacity: {
                    code: 0,
                    name: "Root",
                    color: "gray-600",
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
              name: item.name,
              color: "gray-600", // dark gray for unknown capacities
              icon: "",
              hasChildren: false,
              parentCapacity: undefined,
              skill_type: Number(item.skill_type) || 0,
              skill_wikidata_item: item.skill_wikidata_item || "",
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
