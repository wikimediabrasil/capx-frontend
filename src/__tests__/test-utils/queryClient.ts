import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a test QueryClient with disabled retries
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}
