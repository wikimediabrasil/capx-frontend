import AuthMonitorSetup from '@/components/AuthMonitorSetup';
import AxiosInterceptorSetup from '@/components/AxiosInterceptorSetup';
import { CapacitiesPrefetcher } from '@/components/CapacitiesPrefetcher';
import ErrorBoundary from '@/components/ErrorBoundary';
import HydrationHandler from '@/components/HydrationHandler';
import SessionWrapper from '@/components/SessionWrapper';
import StoreHydrator from '@/components/StoreHydrator';
import { Metadata } from 'next';
import './globals.css';
import Providers from './provider';
import { SnackbarProvider } from './providers/SnackbarProvider';

export const metadata: Metadata = {
  title: 'CapX - Capacity Exchange',
  description: 'Exchange your capacities with other users',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="next-image-preload-policy" content="default" />
      </head>
      <body id="root" className="min-h-screen" suppressHydrationWarning>
        <ErrorBoundary>
          <HydrationHandler />
          <AxiosInterceptorSetup />
          <SessionWrapper>
            <AuthMonitorSetup />
            <Providers>
              <StoreHydrator />
              <SnackbarProvider>
                <CapacitiesPrefetcher />
                {children}
              </SnackbarProvider>
            </Providers>
          </SessionWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
