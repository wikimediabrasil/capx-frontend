import { useState, useEffect, useCallback } from "react";
import { capacityService } from "@/services/capacityService";
import { Capacity } from "@/types/capacity";
import { useSession } from "next-auth/react";
import { getCapacityColor, getCapacityIcon } from "@/lib/utils/capacitiesUtils";

export function useCapacities(language: string = "en") {
  const { data: session } = useSession();
  const token = session?.user?.token;

  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCapacities = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Primeiro, buscamos as capacidades raiz
      const rootResponse = await capacityService.fetchCapacities({
        params: { language },
        headers: { Authorization: `Token ${token}` },
      });

      const rootCapacities = rootResponse.map((item: any): Capacity => {
        const baseCode = item.code.toString();
        return {
          code: Number(baseCode),
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

      // Coletamos todas as capacidades
      let allCapacities: Capacity[] = [...rootCapacities];

      // Para cada capacidade raiz, buscamos seus filhos
      for (const rootCapacity of rootCapacities) {
        try {
          const childrenResponse = await capacityService.fetchCapacitiesByType(
            rootCapacity.code.toString(),
            {
              headers: { Authorization: `Token ${token}` },
            }
          );

          // Transformamos a resposta (que é um objeto) em um array de capacidades
          const childrenCapacities = await Promise.all(
            Object.entries(childrenResponse).map(async ([code, name]) => {
              // Verificamos se este filho tem seus próprios filhos
              const grandchildrenResponse =
                await capacityService.fetchCapacitiesByType(code, {
                  headers: { Authorization: `Token ${token}` },
                });

              const hasChildren = Object.keys(grandchildrenResponse).length > 0;

              return {
                code: Number(code),
                name: name as unknown as string,
                color: getCapacityColor(rootCapacity.color || "gray-200"),
                icon: rootCapacity.icon,
                hasChildren,
                skill_type: rootCapacity.code,
                skill_wikidata_item: "",
              } as Capacity;
            })
          );

          // Adicionamos os filhos à lista completa
          allCapacities = [...allCapacities, ...childrenCapacities];

          // Para cada filho que tem seus próprios filhos (netos da raiz), buscamos também
          for (const childCapacity of childrenCapacities) {
            if (childCapacity.hasChildren) {
              try {
                const grandchildrenResponse =
                  await capacityService.fetchCapacitiesByType(
                    childCapacity.code.toString(),
                    {
                      headers: { Authorization: `Token ${token}` },
                    }
                  );

                // Transformamos a resposta em capacidades
                const grandchildrenCapacities = Object.entries(
                  grandchildrenResponse
                ).map(
                  ([code, name]): Capacity => ({
                    code: Number(code),
                    name: name as unknown as string,
                    color: childCapacity.color,
                    icon: childCapacity.icon,
                    hasChildren: false, // Assumimos que netos não têm filhos
                    skill_type: childCapacity.code,
                    skill_wikidata_item: "",
                  })
                );

                // Adicionamos os netos à lista completa
                allCapacities = [...allCapacities, ...grandchildrenCapacities];
              } catch (grandchildError) {
                console.error(
                  `Erro ao buscar netos da capacidade ${childCapacity.code}:`,
                  grandchildError
                );
              }
            }
          }
        } catch (childError) {
          console.error(
            `Erro ao buscar filhos da capacidade ${rootCapacity.code}:`,
            childError
          );
        }
      }

      setCapacities(allCapacities);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao buscar capacidades"
      );
      console.error("Erro ao buscar capacidades:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, language]);

  useEffect(() => {
    fetchAllCapacities();
  }, [fetchAllCapacities]);

  const getCapacityById = useCallback(
    (id: number): Capacity | undefined => {
      return capacities.find((capacity) => capacity.code === id);
    },
    [capacities]
  );

  return {
    capacities,
    isLoading,
    error,
    getCapacityById,
    refresh: fetchAllCapacities,
  };
}
