"use client";

import { useEffect, useState } from "react";
import { useCapacityCache } from "@/contexts/CapacityCacheContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

// Component to load capacities in the background
export const CapacitiesPrefetcher = () => {
  const { prefetchCapacityData, isLoaded, clearCache } = useCapacityCache();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hasPrefetched, setHasPrefetched] = useState(false);
  const queryClient = useQueryClient();

  // Start loading when the user navigates
  useEffect(() => {
    if (session?.user && !isLoaded && !hasPrefetched) {
      console.log("🔄 Starting capacity prefetch...");

      // Use setTimeout to avoid blocking initial rendering
      setTimeout(() => {
        prefetchCapacityData().then(() => {
          setHasPrefetched(true);
        });
      }, 2000); // Small delay to prioritize page rendering
    } else if (isLoaded && !hasPrefetched) {
      // If already loaded but not marked as prefetched
      console.log("✅ Capacities already loaded, skipping prefetch");
      setHasPrefetched(true);
    }
  }, [session, isLoaded, hasPrefetched, prefetchCapacityData]);

  // Monitor changes in route to avoid unnecessary prefetch
  useEffect(() => {
    if (session?.user && !isLoaded && !hasPrefetched) {
      setHasPrefetched(true);
      prefetchCapacityData();
    } else if (isLoaded && !hasPrefetched) {
      setHasPrefetched(true);
    }
  }, [pathname, session, isLoaded, hasPrefetched, prefetchCapacityData]);

  return null;
};
