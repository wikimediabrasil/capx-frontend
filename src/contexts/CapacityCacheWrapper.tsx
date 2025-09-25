'use client';
import React, { useEffect, useState } from 'react';
import { CapacityCacheProvider } from '@/contexts/CapacityCacheContext';

/**
 * Simplified wrapper component for the unified CapacityCacheProvider
 */
export function CapacityCacheWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simple wrapper - unified cache handles all language logic internally
  if (!isClient) {
    return <CapacityCacheProvider>{children}</CapacityCacheProvider>;
  }

  return <CapacityCacheProvider>{children}</CapacityCacheProvider>;
}
