"use client";

import { useState, useEffect } from "react";
import D3TreeVisualization from "./D3TreeVisualization";
import { staticCapacities, Capacity } from "../data/staticCapacities";

export default function CapacitiesTreeVisualization() {
  const [capacities, setCapacities] = useState<Capacity[]>(staticCapacities);
  const [isLoading, setIsLoading] = useState(false); // Temporariamente desabilitado





  // Temporariamente comentado para evitar problemas de autenticação
  /*
  useEffect(() => {
    const loadCapacitiesWithDescriptions = async () => {
      try {
        setIsLoading(true);
        // Buscar descrições do Metabase
        const capacitiesWithDescriptions = await fetchCapacityDescriptions(STATIC_CAPACITIES, "pt");
        setCapacities(capacitiesWithDescriptions);
      } catch (error) {
        console.error("Erro ao carregar descrições das capacidades:", error);
        // Em caso de erro, usar as capacidades originais
        setCapacities(STATIC_CAPACITIES);
      } finally {
        setIsLoading(false);
      }
    };

    loadCapacitiesWithDescriptions();
  }, []);
  */

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Carregando descrições das capacidades...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 sm:my-12">
      <D3TreeVisualization
        data={capacities}
        width={1200}
        height={800}
      />
    </div>
  );
} 