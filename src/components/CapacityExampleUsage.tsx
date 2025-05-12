"use client";

import { useState } from "react";
import { Capacity } from "@/types/capacity";
import { useCapacities, CAPACITY_CACHE_KEYS } from "@/hooks/useCapacities";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Este componente demonstra como utilizar os novos hooks otimizados de capacidades.
 * Mostra exemplos de uso para diferentes cenários e como aproveitar o cache.
 */
export default function CapacityExampleUsage() {
  const queryClient = useQueryClient();
  const [selectedParentCode, setSelectedParentCode] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Usar o hook principal
  const capacitiesHook = useCapacities();
  const { rootCapacities, isLoadingRootCapacities } = capacitiesHook;

  // Usar o hook para capacidades por parent code
  const {
    data: childCapacities,
    isLoading: isLoadingChildren,
    error: childrenError,
  } = capacitiesHook.useCapacitiesByParent(selectedParentCode);

  // Busca não está mais disponível na nova implementação, vamos desabilitar esta funcionalidade
  const searchResults = [];
  const isSearching = false;
  const searchError = null;

  // Função para forçar a invalidação do cache caso necessário
  const invalidateCapacityCache = () => {
    queryClient.invalidateQueries({ queryKey: CAPACITY_CACHE_KEYS.all });
  };

  // Função para pré-carregar dados (útil em situações onde sabemos que precisaremos dos dados)
  const preloadCapacitiesByParent = async (parentCode: string) => {
    const rootCapacity = rootCapacities.find(
      (cap) => cap.code.toString() === parentCode
    );
    if (!rootCapacity) return;

    await queryClient.prefetchQuery({
      queryKey: CAPACITY_CACHE_KEYS.byParent(parentCode),
      queryFn: async () => {
        // Implementação similar ao fetchCapacitiesByParent no hook
        // Este é um exemplo simplificado
        console.log(`Pré-carregando capacidades do parent ${parentCode}`);
        return [];
      },
    });
  };

  if (isLoadingRootCapacities) {
    return <div>Carregando capacidades raiz...</div>;
  }

  const handleSelectParent = (parentCode: string) => {
    setSelectedParentCode(parentCode);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Exemplo de Uso de Capacidades Otimizadas
      </h1>

      {/* Exemplo de capacidades raiz */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Capacidades Raiz</h2>
        <ul>
          {rootCapacities.map((capacity: Capacity) => (
            <li
              key={capacity.code}
              onClick={() => handleSelectParent(capacity.code.toString())}
            >
              {capacity.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Exemplo de capacidades filhas */}
      {selectedParentCode && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Subcapacidades de{" "}
            {
              rootCapacities.find(
                (c) => c.code.toString() === selectedParentCode
              )?.name
            }
          </h2>
          {isLoadingChildren ? (
            <p>Carregando subcapacidades...</p>
          ) : childrenError ? (
            <p className="text-red-500">Erro ao carregar subcapacidades</p>
          ) : (
            <ul>
              {childCapacities?.map((childCapacity: Capacity) => (
                <li key={childCapacity.code}>{childCapacity.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Exemplo de busca de capacidades - agora desabilitado */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Buscar Capacidades (Desabilitado)
        </h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Função de busca desabilitada na nova implementação"
            className="flex-1 p-2 border rounded"
            disabled
          />
        </div>
        <p className="text-amber-500">
          A funcionalidade de busca foi desabilitada na nova implementação do
          hook useCapacities.
        </p>
      </div>

      {/* Ações adicionais */}
      <div className="flex gap-4">
        <button
          onClick={invalidateCapacityCache}
          className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Invalidar Cache (Forçar Nova Requisição)
        </button>
        <button
          onClick={() => preloadCapacitiesByParent("106")} // Exemplo: pré-carregar capacidades de tecnologia
          className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
        >
          Pré-Carregar Capacidades de Tecnologia
        </button>
      </div>
    </div>
  );
}
