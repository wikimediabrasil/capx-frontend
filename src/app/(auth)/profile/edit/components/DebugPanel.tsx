'use client';

import { useState } from 'react';

interface DebugPanelProps {
  data: any;
  title?: string;
}

/**
 * Um componente utilizado para depuração durante o desenvolvimento
 * Mostra dados em formato JSON em um painel expansível
 */
export default function DebugPanel({ data, title = 'Debug Info' }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
      <div
        className="px-4 py-2 bg-gray-700 cursor-pointer flex justify-between items-center"
        onClick={togglePanel}
      >
        <span className="font-medium">{title}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="p-4 max-h-96 overflow-auto">
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
