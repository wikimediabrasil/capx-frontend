'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { setDocumentLocale } from '@/lib/utils/dateLocale';
import { AppStore } from './types';

// Default page content (same as AppContext)
const defaultPageContent: Record<string, string> = {
  'capacity-card-explore-capacity': 'Explore capacity',
  'capacity-card-expand-capacity': 'Expand',
  'capacity-card-info': 'Information',
  'capacity-banner-title': 'Exchange Everything',
  'capacity-search-no-results': 'No results found',
  'capacity-visualization-title': 'Interactive Capacity Visualization',
  'capacity-visualization-description':
    'Click on main capacities to expand/collapse and focus • Click on icons to see details and automatically center • Use mouse to zoom and drag • Click "Return to initial view" to reset focus',
  'capacity-visualization-reset-button': 'Return to initial view',
};

// Get initial language from localStorage
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en';
  }
  return 'en';
};

// Initial state
const initialState = {
  isMobile: false,
  mobileMenuStatus: false,
  language: getInitialLanguage(),
  pageContent: defaultPageContent,
  session: null,
  mounted: false,
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,

        // Actions
        setMobileMenuStatus: (status: boolean) => {
          set({ mobileMenuStatus: status });
        },

        setLanguage: (language: string) => {
          set({ language });
          if (typeof window !== 'undefined') {
            localStorage.setItem('language', language);
            setDocumentLocale(language);
          }
        },

        setPageContent: (content: Record<string, string>) => {
          set({ pageContent: content });
        },

        setSession: (session: any) => {
          set({ session });
        },

        setIsMobile: (isMobile: boolean) => {
          set({ isMobile });
          // Auto-close mobile menu when switching to desktop
          if (!isMobile) {
            set({ mobileMenuStatus: false });
          }
        },

        hydrate: () => {
          if (typeof window === 'undefined') {
            return () => {}; // Return no-op cleanup for SSR
          }

          // Prevent multiple hydrations
          const state = get();
          if (state.mounted) {
            return () => {}; // Already hydrated
          }

          // Handle initial mobile detection
          const isMobile = window.innerWidth <= 768;
          set({ isMobile, mounted: true });

          // Set up resize listener
          const checkIsMobile = () => {
            const newIsMobile = window.innerWidth <= 768;
            const currentState = get();
            if (currentState.isMobile !== newIsMobile) {
              set({ isMobile: newIsMobile });
              // Auto-close mobile menu when switching to desktop
              if (!newIsMobile) {
                set({ mobileMenuStatus: false });
              }
            }
          };

          window.addEventListener('resize', checkIsMobile);

          // Load language from localStorage and set locale
          const savedLanguage = localStorage.getItem('language');
          if (savedLanguage && savedLanguage !== state.language) {
            set({ language: savedLanguage });
            setDocumentLocale(savedLanguage);
          }

          // Return cleanup function
          return () => {
            window.removeEventListener('resize', checkIsMobile);
          };
        },
      }),
      {
        name: 'capx-app-store',
        // Only persist language
        partialize: state => ({
          language: state.language,
        }),
        // Skip hydration on server
        skipHydration: typeof window === 'undefined',
      }
    ),
    { name: 'AppStore', enabled: process.env.NODE_ENV === 'development' }
  )
);

// Selector hooks for optimal re-renders
export const useIsMobile = () => useAppStore(state => state.isMobile);
export const useLanguage = () => useAppStore(state => state.language);
export const useMobileMenuStatus = () => useAppStore(state => state.mobileMenuStatus);
export const usePageContent = () => useAppStore(state => state.pageContent);
export const useSession = () => useAppStore(state => state.session);
export const useMounted = () => useAppStore(state => state.mounted);
