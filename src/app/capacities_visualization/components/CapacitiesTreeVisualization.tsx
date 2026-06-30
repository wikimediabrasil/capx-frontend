'use client';

import { CapacitiesTreeSkeleton } from '@/components/skeletons';
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
    const mapNode = (cap: { code: number; name: string }, children: D3Capacity[]): D3Capacity => ({
      id: cap.code.toString(),
      code: cap.code,
      name: getName(cap.code) || cap.name,
      color: getColor(cap.code),
      description: getDescription(cap.code),
      wd_code: getWdCode(cap.code),
      metabase_code: getMetabaseCode(cap.code),
      children,
    });
    const mapGrandchild = (grandchild: { code: number; name: string }) => mapNode(grandchild, []);
    const mapChild = (child: { code: number; name: string }) =>
      mapNode(child, getChildren(child.code).map(mapGrandchild));
    const mapRoot = (root: { code: number; name: string }) =>
      mapNode(root, getChildren(root.code).map(mapChild));
    return getRootCapacities().map(mapRoot);
  }, [capacitiesData]);

  if (isLoadingTranslations || !isLoaded) {
    return <CapacitiesTreeSkeleton />;
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
