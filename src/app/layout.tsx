import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { Metadata } from "next";
import Providers from "./provider";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SnackbarProvider } from "./providers/SnackbarProvider";
import { CapacityCacheProvider } from "@/contexts/CapacityCacheContext";

export const metadata: Metadata = {
  title: "CapX - Capacity Exchange",
  description: "Exchange your capacities with other users",
  viewport: "width=device-width, initial-scale=1",
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
      <body id="root" className="min-h-screen">
        <ThemeProvider>
          <SessionWrapper>
            <AppProvider>
              <SnackbarProvider>
                <CapacityCacheProvider>
                  <Providers>{children}</Providers>
                </CapacityCacheProvider>
              </SnackbarProvider>
            </AppProvider>
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
