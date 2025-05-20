"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useRef, useEffect } from "react";

// Funções auxiliares para serialização
const mapToObject = (map: Map<number, any> | any): Record<string, any> => {
  if (!(map instanceof Map)) return map;
  const obj: Record<string, any> = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

const objectToMap = (
  obj: Record<string, any> | any
): Map<number, any> | any => {
  if (!obj || typeof obj !== "object") return obj;
  const map = new Map<number, any>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(Number(key), value);
  });
  return map;
};

export default function Providers({ children }: { children: React.ReactNode }) {
  // Usar useState em vez de useRef para garantir re-renderização correta
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 60, // 1 hora
            gcTime: 1000 * 60 * 60 * 24, // 24 horas
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      })
  );

  // Remover estado de hidratação que pode causar problemas
  // Next.js 14 gerencia isso automaticamente

  useEffect(() => {
    // Simplificar a função de salvar cache
    if (typeof window === "undefined") return;

    // Tentar recuperar cache armazenado apenas uma vez ao montar
    try {
      const savedCache = localStorage.getItem("capx-capacity-cache");
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        console.log("🔄 Recuperando cache do localStorage...");

        // Converter de volta para Map antes de usar
        if (parsedCache.capacities) {
          const capacitiesMap = objectToMap(parsedCache.capacities);
          queryClient.setQueryData(["all-capacities-map"], capacitiesMap);
        }

        if (parsedCache.children) {
          const childrenMap = objectToMap(parsedCache.children);
          queryClient.setQueryData(["children-map"], childrenMap);
        }

        console.log("✅ Cache recuperado com sucesso");
      }
    } catch (e) {
      console.error("Erro ao recuperar cache:", e);
      // Em caso de erro, limpar o cache para garantir um estado limpo
      localStorage.removeItem("capx-capacity-cache");
    }

    // Salvar cache a cada 30 segundos
    const interval = setInterval(() => {
      try {
        const capacities = queryClient.getQueryData<Map<number, any>>([
          "all-capacities-map",
        ]);
        const children = queryClient.getQueryData<Map<number, any>>([
          "children-map",
        ]);

        if (capacities || children) {
          const cacheToSave = {
            capacities: mapToObject(capacities),
            children: mapToObject(children),
            timestamp: Date.now(),
          };
          localStorage.setItem(
            "capx-capacity-cache",
            JSON.stringify(cacheToSave)
          );
        }
      } catch (e) {
        console.error("Erro ao salvar cache:", e);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
