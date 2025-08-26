'use client';

import { AppProvider } from '@/contexts/AppContext';
import CapacitiesTreeVisualization from './CapacitiesTreeVisualization';

export default function CapacitiesVisualizationWrapper() {
  return (
    <AppProvider>
      <CapacitiesTreeVisualization />
    </AppProvider>
  );
}
