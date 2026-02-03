import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from './queryClient';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  useThemeStore: Object.assign(
    jest.fn(() => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() })),
    { getState: () => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() }) }
  ),
  useIsMobile: jest.fn(() => false),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useMobileMenuStatus: jest.fn(() => false),
  useAppStore: Object.assign(
    jest.fn(() => ({ isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() })),
    { getState: () => ({ isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() }) }
  ),
}));

/**
 * Wrapper with QueryClientProvider for testing
 */
export function createQueryWrapper(queryClient?: QueryClient) {
  const client = queryClient || createTestQueryClient();
  const QueryWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  QueryWrapper.displayName = 'QueryWrapper';
  return QueryWrapper;
}

/**
 * Wrapper with ThemeProvider and AppProvider for testing
 */
export function createThemeAppWrapper() {
  const ThemeAppWrapper = ({ children }: { children: React.ReactNode }) => (
    
      {children}
    
  );
  ThemeAppWrapper.displayName = 'ThemeAppWrapper';
  return ThemeAppWrapper;
}

/**
 * Wrapper with all common providers for testing
 */
export function createAllProvidersWrapper(queryClient?: QueryClient) {
  const client = queryClient || createTestQueryClient();
  const AllProvidersWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      
        {children}
      
    </QueryClientProvider>
  );
  AllProvidersWrapper.displayName = 'AllProvidersWrapper';
  return AllProvidersWrapper;
}

/**
 * Render helper with ThemeProvider and AppProvider
 */
export function renderWithThemeApp(component: React.ReactNode) {
  const Wrapper = createThemeAppWrapper();
  return render(<Wrapper>{component}</Wrapper>);
}
