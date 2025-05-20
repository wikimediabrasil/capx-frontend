"use client";

import { CapacityCacheProvider } from "@/contexts/CapacityCacheContext";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Footer from "@/components/Footer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ThemeProvider>
        <CapacityCacheProvider>
          {children}
          <Footer />
        </CapacityCacheProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
