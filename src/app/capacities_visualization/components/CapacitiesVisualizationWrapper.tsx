'use client';

import { useApp } from '@/contexts/AppContext';
import { CapacityCacheProvider } from '@/contexts/CapacityCacheContext';
import { LanguageChangeHandler } from '@/components/LanguageChangeHandler';
import CapacitiesTreeVisualization from './CapacitiesTreeVisualization';

function CapacitiesVisualizationContent() {
  const { language } = useApp();

  // Use language as key to force remount when language changes
  return <CapacitiesTreeVisualization key={language} />;
}

export default function CapacitiesVisualizationWrapper() {
  return (
    <CapacityCacheProvider>
      <LanguageChangeHandler>
        <CapacitiesVisualizationContent />
      </LanguageChangeHandler>
    </CapacityCacheProvider>
  );
}
