"use client";
import { createContext, useContext, ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { usePrefetchCapacityData } from "@/hooks/useCapacitiesQuery";

interface CapacityCacheContextType {
  preloadCapacities: () => Promise<void>;
  clearCapacityCache: () => void;
}

const CapacityCacheContext = createContext<
  CapacityCacheContextType | undefined
>(undefined);

export function CapacityCacheProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const queryClient = useQueryClient();

  // Use the dedicated prefetch hook
  const { prefetchData } = usePrefetchCapacityData();

  // Function to preload capacity data
  const preloadCapacities = async () => {
    if (token) {
      try {
        // Use the prefetch function from our hook
        await prefetchData();
        console.log("✅ All capacity data preloaded successfully");
      } catch (error) {
        console.error("❌ Error preloading capacity data:", error);
      }
    }
  };

  // Function to clear capacity cache
  const clearCapacityCache = () => {
    // Invalidate all capacity queries
    queryClient.invalidateQueries({ queryKey: ["capacities"] });
    console.log("🧹 Capacity cache cleared");
  };

  // Preload capacity data when the session is available
  useEffect(() => {
    if (token) {
      preloadCapacities();
    }
  }, [token]);

  return (
    <CapacityCacheContext.Provider
      value={{ preloadCapacities, clearCapacityCache }}
    >
      {children}
    </CapacityCacheContext.Provider>
  );
}

export function useCapacityCache() {
  const context = useContext(CapacityCacheContext);
  if (!context) {
    throw new Error(
      "useCapacityCache must be used within a CapacityCacheProvider"
    );
  }
  return context;
}
