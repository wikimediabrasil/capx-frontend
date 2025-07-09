"use client";

import { useState, useEffect } from "react";
import { STATIC_CAPACITIES } from "../data/staticCapacities";
import LoadingState from "@/components/LoadingState";
import D3TreeVisualization from "./D3TreeVisualization";

interface CapacitiesTreeVisualizationProps {}

export default function CapacitiesTreeVisualization({}: CapacitiesTreeVisualizationProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento por um breve momento para mostrar o loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Visualização em Árvore das Capacidades
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Explore todas as capacidades organizadas hierarquicamente, desde as capacidades raiz até suas filhas e netas.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <D3TreeVisualization
          data={STATIC_CAPACITIES}
          width={1000}
          height={1000}
        />
      </div>
    </div>
  );
} 