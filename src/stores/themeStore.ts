'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ThemeStore } from './types';

const initialState = {
  darkMode: false,
  mounted: false,
};

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setDarkMode: (value: boolean) => {
          set({ darkMode: value });
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', value);
            localStorage.setItem('theme', value ? 'dark' : 'light');
          }
        },

        hydrate: () => {
          if (typeof window === 'undefined') {
            return () => {};
          }

          const state = get();
          if (state.mounted) {
            return () => {};
          }

          // Read saved theme or fall back to system preference
          let shouldBeDark = false;
          try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
              shouldBeDark = savedTheme === 'dark';
            } else {
              shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
          } catch (error) {
            console.error('Error accessing localStorage:', error);
          }

          document.documentElement.classList.toggle('dark', shouldBeDark);
          set({ darkMode: shouldBeDark, mounted: true });

          // Listen for system theme changes
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            const savedTheme = localStorage.getItem('theme');
            if (!savedTheme) {
              const { setDarkMode } = get();
              setDarkMode(e.matches);
            }
          };

          mediaQuery.addEventListener('change', handleSystemThemeChange);

          return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
          };
        },
      }),
      {
        name: 'capx-theme-store',
        partialize: state => ({
          darkMode: state.darkMode,
        }),
        skipHydration: typeof window === 'undefined',
      }
    ),
    { name: 'ThemeStore', enabled: process.env.NODE_ENV === 'development' }
  )
);

// Selector hooks
export const useDarkMode = () => useThemeStore(state => state.darkMode);
export const useSetDarkMode = () => useThemeStore(state => state.setDarkMode);
export const useThemeMounted = () => useThemeStore(state => state.mounted);
