"use client";

import { useState, useEffect } from "react";

interface SafeHydrationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that renders its children only when mounted on the client.
 * This prevents hydration errors and issues with accessing localStorage
 * or context hooks that are not found.
 */
export function SafeHydration({
  children,
  fallback = null,
}: SafeHydrationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default SafeHydration;
