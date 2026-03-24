'use client';

import LoadingState from '@/components/LoadingState';
import { useCapacityStore } from '@/stores';
import { useMemo } from 'react';
import D3TreeVisualization from './D3TreeVisualization';

interface D3Capacity {
  id: string;
  code: number;
  name: string;
  color: string;
  description: string;
  wd_code: string;
  metabase_code: string;
  children: D3Capacity[];
}

export default function CapacitiesTreeVisualization() {
  const {
    getRootCapacities,
    getChildren,
    getName,
    getDescription,
    getColor,
    getWdCode,
    getMetabaseCode,
    isLoaded,
    isLoadingTranslations,
  } = useCapacityStore();

  // Subscribe to capacities data so the memo recomputes when the store updates
  const capacitiesData = useCapacityStore(state => state.capacities);

  const d3Data = useMemo<D3Capacity[]>(() => {
    const roots = getRootCapacities();
    return roots.map(root => ({
      id: root.code.toString(),
      code: root.code,
      name: getName(root.code) || root.name,
      color: getColor(root.code),
      description: getDescription(root.code),
      wd_code: getWdCode(root.code),
      metabase_code: getMetabaseCode(root.code),
      children: getChildren(root.code).map(child => ({
        id: child.code.toString(),
        code: child.code,
        name: getName(child.code) || child.name,
        color: getColor(child.code),
        description: getDescription(child.code),
        wd_code: getWdCode(child.code),
        metabase_code: getMetabaseCode(child.code),
        children: getChildren(child.code).map(grandchild => ({
          id: grandchild.code.toString(),
          code: grandchild.code,
          name: getName(grandchild.code) || grandchild.name,
          color: getColor(grandchild.code),
          description: getDescription(grandchild.code),
          wd_code: getWdCode(grandchild.code),
          metabase_code: getMetabaseCode(grandchild.code),
          children: [],
        })),
      })),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capacitiesData]);

  if (isLoadingTranslations || !isLoaded) {
    return <LoadingState fullScreen />;
  }

  if (d3Data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <p className="text-gray-600">Nenhuma capacidade encontrada.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 sm:my-12">
      <D3TreeVisualization data={d3Data} width={1200} height={800} />
    </div>
  );
}
