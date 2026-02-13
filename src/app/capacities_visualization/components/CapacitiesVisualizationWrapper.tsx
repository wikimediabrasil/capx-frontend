'use client';

import { LanguageChangeHandler } from '@/components/LanguageChangeHandler';
import CapacitiesTreeVisualization from './CapacitiesTreeVisualization';

import { useLanguage } from '@/stores';
function CapacitiesVisualizationContent() {
  const language = useLanguage();

  // Use language as key to force remount when language changes
  return <CapacitiesTreeVisualization key={language} />;
}

export default function CapacitiesVisualizationWrapper() {
  return (
    <LanguageChangeHandler>
      <CapacitiesVisualizationContent />
    </LanguageChangeHandler>
  );
}
