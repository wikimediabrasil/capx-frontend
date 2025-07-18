'use client';

import CapacitiesTreeVisualization from './CapacitiesTreeVisualization';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function CapacitiesVisualizationWrapper() {
  return (
      <AppProvider>
        <CapacitiesTreeVisualization />
      </AppProvider>
  ); 
}