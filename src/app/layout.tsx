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
import { SafeBadgesProvider } from "@/contexts/SafeBadgesProvider";
import AxiosInterceptorSetup from "@/components/AxiosInterceptorSetup";
import AuthMonitorSetup from "@/components/AuthMonitorSetup";

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
          <AxiosInterceptorSetup />
          <ThemeProvider>
            <SessionWrapper>
              <AuthMonitorSetup />
              <Providers>
                <AppProvider>
                  <ProfileEditProvider>
                    <SnackbarProvider>
                      <CapacityCacheProvider>
                        <SafeBadgesProvider>
                          <CapacitiesPrefetcher />
                          {children}
                        </SafeBadgesProvider>
                      </CapacityCacheProvider>
                    </SnackbarProvider>
                  </ProfileEditProvider>
                </AppProvider>
              </Providers>
            </SessionWrapper>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
