import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import { createTestQueryClient } from './queryClient';

/**
 * Wrapper with QueryClientProvider for testing
 */
export function createQueryWrapper(queryClient?: QueryClient) {
  const client = queryClient || createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

/**
 * Wrapper with ThemeProvider and AppProvider for testing
 */
export function createThemeAppWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
      <AppProvider>{children}</AppProvider>
    </ThemeProvider>
  );
}

/**
 * Wrapper with all common providers for testing
 */
export function createAllProvidersWrapper(queryClient?: QueryClient) {
  const client = queryClient || createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <AppProvider>{children}</AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

/**
 * Render helper with ThemeProvider and AppProvider
 */
export function renderWithThemeApp(component: React.ReactNode) {
  const Wrapper = createThemeAppWrapper();
  return render(<Wrapper>{component}</Wrapper>);
}
