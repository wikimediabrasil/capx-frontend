'use client';

import LoadingState from '@/components/LoadingState';
import { useApp } from '@/contexts/AppContext';
import { useRootCapacities } from '@/hooks/useCapacitiesQuery';
import { useCapacityList } from '@/hooks/useCapacityList';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef, useMemo } from 'react';
import D3TreeVisualization from './D3TreeVisualization';

// Specific interface for D3 visualization
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
  const previousLanguageRef = useRef<string>(language);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch root capacities
  const { data: rootCapacities = [], isLoading: isLoadingRoots } = useRootCapacities(language);

  // Use capacity list hook for fetching children and descriptions
  const { fetchCapacitiesByParent, fetchCapacityDescription } = useCapacityList(
    session?.user?.token,
    language
  );

  // Create a stable reference to root capacities based on codes
  const rootCapacitiesCodes = useMemo(
    () => rootCapacities.map(cap => cap.code).join(','),
    [rootCapacities]
  );

  // Transform API data to match the expected format for D3 visualization
  useEffect(() => {
    // If language changed, abort previous request and reset
    if (previousLanguageRef.current !== language) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setCapacities([]);
      previousLanguageRef.current = language;
    }

    if (!rootCapacities || rootCapacities.length === 0) {
      if (!isLoadingRoots) {
        setIsLoading(false);
      }
      return;
    }

    if (!session?.user?.token) {
      setIsLoading(false);
      return;
    }

    const transformCapacities = async () => {
      // Create new abort controller for this transformation
      abortControllerRef.current = new AbortController();
      setIsLoading(true);

      try {
        const transformedCapacities: D3Capacity[] = [];

        for (const rootCapacity of rootCapacities) {
          // Check if aborted
          if (abortControllerRef.current.signal.aborted) {
            return;
          }

          // Transform root capacity
          const transformedRoot: D3Capacity = {
            id: rootCapacity.code.toString(),
            name: rootCapacity.name,
            color: rootCapacity.color,
            description: rootCapacity.description || '',
            children: [],
          };

          // If root has children, fetch them using the hook
          if (rootCapacity.hasChildren) {
            try {
              // Fetch children using hook
              const children = await fetchCapacitiesByParent(rootCapacity.code.toString());

              // Check if aborted after fetch
              if (abortControllerRef.current.signal.aborted) {
                return;
              }

              // Transform children and fetch their data
              const childrenPromises = children.map(async child => {
                const childCode =
                  typeof child.code === 'string' ? child.code : child.code.toString();

                // Ensure child has a valid name
                const childName =
                  typeof child.name === 'string' && child.name
                    ? child.name
                    : `Capacity ${childCode}`;

                // Fetch child capacity description using hook
                let description = '';
                try {
                  description = (await fetchCapacityDescription(Number(childCode))) || '';
                } catch (error) {
                  console.error(`Error fetching description for capacity ${childCode}:`, error);
                }

                // Fetch grandchildren using hook
                let grandchildren: D3Capacity[] = [];
                if (child.hasChildren) {
                  try {
                    const grandchildrenData = await fetchCapacitiesByParent(childCode);

                    // Transform grandchildren
                    grandchildren = await Promise.all(
                      grandchildrenData.map(async grandChild => {
                        const grandChildCode =
                          typeof grandChild.code === 'string'
                            ? grandChild.code
                            : grandChild.code.toString();

                        // Ensure grandchild has a valid name
                        const grandChildName =
                          typeof grandChild.name === 'string' && grandChild.name
                            ? grandChild.name
                            : `Capacity ${grandChildCode}`;

                        // Fetch grandchild description using hook
                        let grandDescription = '';
                        try {
                          grandDescription =
                            (await fetchCapacityDescription(Number(grandChildCode))) || '';
                        } catch (error) {
                          console.error(
                            `Error fetching description for grandchild ${grandChildCode}:`,
                            error
                          );
                        }

                        return {
                          id: grandChildCode,
                          name: grandChildName,
                          color: 'gray-200',
                          description: grandDescription,
                          children: [],
                        };
                      })
                    );
                  } catch (error) {
                    console.error(`Error fetching grandchildren for capacity ${childCode}:`, error);
                  }
                }

                return {
                  id: childCode,
                  name: childName,
                  color: 'gray-200',
                  description,
                  children: grandchildren,
                };
              });

              transformedRoot.children = await Promise.all(childrenPromises);
            } catch (error) {
              console.error(`Error fetching children for capacity ${rootCapacity.code}:`, error);
            }
          }

          transformedCapacities.push(transformedRoot);
        }

        // Only update state if not aborted
        if (!abortControllerRef.current.signal.aborted) {
          setCapacities(transformedCapacities);
        }
      } catch (error) {
        console.error('Error transforming capacities:', error);
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    transformCapacities();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    rootCapacitiesCodes,
    language,
    session?.user?.token,
    isLoadingRoots,
    fetchCapacitiesByParent,
    fetchCapacityDescription,
  ]);

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
