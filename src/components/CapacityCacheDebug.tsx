'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { CAPACITY_CACHE_KEYS } from '@/hooks/useCapacitiesQuery';
import { useRootCapacities } from '@/hooks/useCapacitiesQuery';

/**
 * A debug component to visualize and manage capacity cache data
 * Only intended to be used in development
 */
export default function CapacityCacheDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { preloadCapacities, clearCapacityCache } = useCapacityCache();
  const { data: rootCapacities = [] } = useRootCapacities();

  // Get current cache status
  const allCacheKeys = queryClient
    .getQueryCache()
    .getAll()
    .map(query => JSON.stringify(query.queryKey))
    .filter(key => key.includes('capacities'));

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg"
      >
        {isOpen ? 'Hide Cache Debug' : 'Show Cache Debug'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Capacity Cache Debug</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Cache Status</h3>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => preloadCapacities()}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Preload Capacity Data
                </button>
                <button
                  onClick={() => clearCapacityCache()}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Clear Cache
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Root Capacities in Cache</h3>
              <div className="border p-2 rounded bg-gray-50 mb-4">
                <p>
                  Cache has {Array.isArray(rootCapacities) ? rootCapacities.length : 0} root
                  capacities
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Active Cache Keys ({allCacheKeys.length})
              </h3>
              <div className="border p-2 rounded bg-gray-50 max-h-[300px] overflow-auto">
                <ul className="list-disc pl-6">
                  {allCacheKeys.map((key, index) => (
                    <li key={index} className="text-xs font-mono mb-1">
                      {key}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
