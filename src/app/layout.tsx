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
import { BadgesProvider } from "@/contexts/BadgesContext";

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
    <html lang="en">
      <head>
        <meta name="next-image-preload-policy" content="default" />
      </head>
      <body id="root" className="min-h-screen" suppressHydrationWarning>
        <HydrationHandler />
        <ThemeProvider>
          <SessionWrapper>
            <AppProvider>
              <ProfileEditProvider>
                <SnackbarProvider>
                  <CapacityCacheProvider>
                    <BadgesProvider>
                      <Providers>{children}</Providers>
                    </BadgesProvider>
                  </CapacityCacheProvider>
                </SnackbarProvider>
              </ProfileEditProvider>
            </AppProvider>
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
