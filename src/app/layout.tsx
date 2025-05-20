import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { Metadata } from "next";
import Providers from "./provider";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SnackbarProvider } from "./providers/SnackbarProvider";
import { CapacityCacheProvider } from "@/contexts/CapacityCacheContext";
import HydrationHandler from "@/components/HydrationHandler";
import { ProfileEditProvider } from "@/contexts/ProfileEditContext";
import { CapacitiesPrefetcher } from "@/components/CapacitiesPrefetcher";
import ErrorBoundary from "@/components/ErrorBoundary";
import dynamic from "next/dynamic";

// Carregar ferramentas de diagnóstico apenas no cliente
const DiagnosticTool = dynamic(() => import("@/components/DiagnosticTool"), {
  ssr: false,
});

const SessionDebug = dynamic(() => import("@/components/SessionDebug"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "CapX - Capacity Exchange",
  description: "Exchange your capacities with other users",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="next-image-preload-policy" content="default" />
      </head>
      <body id="root" className="min-h-screen" suppressHydrationWarning>
        <ErrorBoundary>
          <HydrationHandler />
          <AppProvider>
            <ThemeProvider>
              <SessionWrapper>
                <Providers>
                  <ProfileEditProvider>
                    <SnackbarProvider>
                      <CapacityCacheProvider>
                        <CapacitiesPrefetcher />
                        {children}
                        {process.env.NODE_ENV !== "production" && (
                          <>
                            <DiagnosticTool />
                            <SessionDebug />
                          </>
                        )}
                      </CapacityCacheProvider>
                    </SnackbarProvider>
                  </ProfileEditProvider>
                </Providers>
              </SessionWrapper>
            </ThemeProvider>
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
