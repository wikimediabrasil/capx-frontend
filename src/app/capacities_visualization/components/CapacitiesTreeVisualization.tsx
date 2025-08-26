'use client';

import LoadingState from '@/components/LoadingState';
import { useApp } from '@/contexts/AppContext';
import { useRootCapacities } from '@/hooks/useCapacitiesQuery';
import { capacityService } from '@/services/capacityService';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import D3TreeVisualization from './D3TreeVisualization';

// Interface específica para a visualização D3
interface D3Capacity {
  id: string;
  name: string;
  color: string;
  description: string;
  children: D3Capacity[];
}

export default function CapacitiesTreeVisualization() {
  const { language } = useApp();
  const { data: session } = useSession();
  const [capacities, setCapacities] = useState<D3Capacity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch root capacities
  const { data: rootCapacities = [], isLoading: isLoadingRoots } = useRootCapacities(language);

  // Transform API data to match the expected format for D3 visualization
  useEffect(() => {
    if (!rootCapacities || rootCapacities.length === 0) return;

    const transformCapacities = async () => {
      setIsLoading(true);

      try {
        const transformedCapacities: D3Capacity[] = [];

        for (const rootCapacity of rootCapacities) {
          // Transform root capacity
          const transformedRoot: D3Capacity = {
            id: rootCapacity.code.toString(),
            name: rootCapacity.name,
            color: rootCapacity.color,
            description: rootCapacity.description || '',
            children: [],
          };

          // If root has children, fetch them
          if (rootCapacity.hasChildren && session?.user?.token) {
            try {
              const children = await capacityService.fetchCapacitiesByType(
                rootCapacity.code.toString(),
                {
                  headers: { Authorization: `Token ${session.user.token}` },
                },
                language
              );

              transformedRoot.children = Object.entries(children).map(([code, nameOrResponse]) => {
                const name = typeof nameOrResponse === 'string'
                  ? nameOrResponse
                  : nameOrResponse?.name || `Capacity ${code}`;

                return {
                  id: code,
                  name,
                  color: 'gray-200',
                  description: '',
                  children: [],
                };
              });
            } catch (error) {
              console.error(`Error fetching children for capacity ${rootCapacity.code}:`, error);
            }
          }

          transformedCapacities.push(transformedRoot);
        }

        setCapacities(transformedCapacities);
      } catch (error) {
        console.error('Error transforming capacities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    transformCapacities();
  }, [rootCapacities, language, session?.user?.token]);

  if (isLoading || isLoadingRoots) {
    return <LoadingState fullScreen />;
  }

  if (!session?.user?.token) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <p className="text-gray-600">Por favor, faça login para visualizar as capacidades.</p>
      </div>
    );
  }

  if (capacities.length === 0) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <p className="text-gray-600">Nenhuma capacidade encontrada.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 sm:my-12">
      <D3TreeVisualization data={capacities} width={1200} height={800} />
    </div>
  );
}
