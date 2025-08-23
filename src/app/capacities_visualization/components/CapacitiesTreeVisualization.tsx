'use client';

import { useState, useEffect } from 'react';
import D3TreeVisualization from './D3TreeVisualization';
import { staticCapacities, Capacity } from '../data/staticCapacities';
import LoadingState from '@/components/LoadingState';

export default function CapacitiesTreeVisualization() {
  const [capacities, setCapacities] = useState<Capacity[]>(staticCapacities);
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <LoadingState fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 sm:my-12">
      <D3TreeVisualization data={capacities} width={1200} height={800} />
    </div>
  );
}
