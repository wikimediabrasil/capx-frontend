'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// Auxiliary functions for serialization
export const mapToObject = (map: Map<number, any> | any): Record<string, any> => {
  if (!(map instanceof Map)) return map;
  const obj: Record<string, any> = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};
export const objectToMap = (obj: Record<string, any> | any): Map<number, any> | any => {
  if (!obj || typeof obj !== 'object') return obj;
  const map = new Map<number, any>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(Number(key), value);
  });
  return map;
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 60 * 24, // 24 hours
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
