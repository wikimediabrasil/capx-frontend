import React, { useState, useRef, useEffect } from 'react';
import { useCapacityDetails } from '@/hooks/useCapacityDetails';
import { ensureArray, safeStringify } from '@/lib/utils/safeDataAccess';

interface CapacityDebugProps {
  capacityIds: any[];
  knownSkills?: any[];
  availableSkills?: any[];
  wantedSkills?: any[];
  enabled?: boolean;
}

/**
 * A debugging component to help diagnose capacity-related issues.
 * Only renders in development mode when enabled is true.
 */
export default function CapacityDebug({
  capacityIds,
  knownSkills,
  availableSkills,
  wantedSkills,
  enabled = process.env.NODE_ENV === 'development',
}: CapacityDebugProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hookError, setHookError] = useState<Error | null>(null);
  const [shouldRender, setShouldRender] = useState(true);

  // Always call the hook unconditionally at the top level
  const capacityDetails = useCapacityDetails(capacityIds);

  // Use effect to handle errors and update state safely
  useEffect(() => {
    // Set if we should render the component based on the enabled prop
    setShouldRender(!!enabled);
  }, [enabled]);

  // After all hooks are called, we can return conditionally
  if (!shouldRender) {
    return null;
  }

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // Safe stringify helper
  const stringify = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return `[Error stringifying: ${(error as Error).message}]`;
    }
  };

  // Format arrays safely
  const safeKnown = ensureArray(knownSkills);
  const safeAvailable = ensureArray(availableSkills);
  const safeWanted = ensureArray(wantedSkills);

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
      <div
        className="px-4 py-2 bg-gray-700 cursor-pointer flex justify-between items-center"
        onClick={togglePanel}
      >
        <span className="font-medium">Capacity Debug</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="p-4 max-h-96 overflow-auto text-xs">
          <h3 className="font-bold mb-2">Capacity IDs:</h3>
          <pre>{stringify(capacityIds)}</pre>

          <h3 className="font-bold mt-3 mb-2">Skills:</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <h4 className="font-semibold">Known ({safeKnown.length}):</h4>
              <pre>{stringify(safeKnown)}</pre>
            </div>
            <div>
              <h4 className="font-semibold">Available ({safeAvailable.length}):</h4>
              <pre>{stringify(safeAvailable)}</pre>
            </div>
            <div>
              <h4 className="font-semibold">Wanted ({safeWanted.length}):</h4>
              <pre>{stringify(safeWanted)}</pre>
            </div>
          </div>

          <h3 className="font-bold mt-3 mb-2">Hook Status:</h3>
          {hookError ? (
            <div className="text-red-500">
              <p>Error: {hookError.message}</p>
              <pre>{hookError.stack}</pre>
            </div>
          ) : (
            <pre>{stringify(capacityDetails)}</pre>
          )}

          <div className="mt-4 p-2 bg-gray-700 rounded">
            <p className="font-semibold mb-1">Test Capacity Names:</p>
            {capacityIds.slice(0, 5).map((id: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span>ID {id}:</span>
                <span className="font-mono">
                  {capacityDetails?.getCapacityName
                    ? (() => {
                        try {
                          return capacityDetails.getCapacityName(id);
                        } catch (e) {
                          return `Error: ${(e as Error).message}`;
                        }
                      })()
                    : 'getCapacityName not available'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
