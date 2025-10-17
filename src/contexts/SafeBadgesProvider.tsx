'use client';

import { BadgesProvider } from './BadgesContext';
import { useApp } from './AppContext';

// This component safely provides BadgesProvider only when AppContext is available
export function SafeBadgesProvider({ children }: { children: React.ReactNode }) {
  // Try to safely use the AppContext
  try {
    // If this doesn't throw, AppContext is available
    useApp();

    // If AppContext is available, wrap children in BadgesProvider
    return <BadgesProvider>{children}</BadgesProvider>;
  } catch {
    // If AppContext is not available, just render children without BadgesProvider
    return <>{children}</>;
  }
}
