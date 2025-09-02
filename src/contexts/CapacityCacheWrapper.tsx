'use client';
import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { CapacityCacheProvider } from '@/contexts/CapacityCacheContext';
import { CapacityDescriptionProvider } from '@/contexts/CapacityContext';

/**
 * Wrapper component that connects AppContext language to CapacityCacheProvider
 */
export function CapacityCacheWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // On server or before hydration, use default language
  if (!isClient) {
    return (
      <CapacityCacheProvider language="en">
        <CapacityDescriptionProvider language="en">{children}</CapacityDescriptionProvider>
      </CapacityCacheProvider>
    );
  }

  // On client side, use the AppContext safely
  return <ClientSideWrapper>{children}</ClientSideWrapper>;
}

// Client-side wrapper that can safely use hooks
function ClientSideWrapper({ children }: { children: React.ReactNode }) {
  const { language } = useApp();

  return (
    <CapacityCacheProvider language={language}>
      <CapacityDescriptionProvider language={language}>{children}</CapacityDescriptionProvider>
    </CapacityCacheProvider>
  );
}
