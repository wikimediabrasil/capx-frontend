'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { useAppStore } from '@/stores/appStore';

/**
 * Hydrates Zustand stores that need client-side initialization.
 * Replaces ThemeProvider and AppProvider wrappers.
 */
export default function StoreHydrator() {
  useEffect(() => {
    const cleanupTheme = useThemeStore.getState().hydrate();
    const cleanupApp = useAppStore.getState().hydrate();

    return () => {
      cleanupTheme();
      cleanupApp();
    };
  }, []);

  return null;
}
