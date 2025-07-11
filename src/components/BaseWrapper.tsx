'use client';
import Navbar from './Navbar';
import { useApp } from '@/contexts/AppContext';
import { useSession } from 'next-auth/react';
import Footer from './Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { ErrorBoundary } from 'react-error-boundary';
import { useState, useEffect } from 'react';

interface BaseWrapperProps {
  children: React.ReactNode;
}

function ErrorFallback({ error }: { error: Error }) {
  const { pageContent } = useApp();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {pageContent['error-fallback-title']}
        </h2>
        <p className="text-gray-700 mb-4">{pageContent['error-fallback-description']}</p>
        <div className="text-sm text-left bg-gray-100 p-3 rounded mb-4 overflow-auto max-h-32">
          <pre>{error.message}</pre>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {pageContent['error-fallback-try-again']}
        </button>
      </div>
    </div>
  );
}

function BaseContent({ children }: BaseWrapperProps) {
  const { language, setLanguage } = useApp();
  const { data: session } = useSession();
  const { darkMode } = useTheme();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar session={session} language={language} setLanguage={setLanguage} />
      <main className={`flex-grow ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function BaseWrapper({ children }: BaseWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Short delay to ensure all contexts are initialized
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BaseContent>{children}</BaseContent>
    </ErrorBoundary>
  );
}
