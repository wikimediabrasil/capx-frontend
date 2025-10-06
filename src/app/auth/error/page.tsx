'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) setError(errorParam);
  }, [searchParams]);

  const handleReturnHome = () => {
    // Clears any error state and redirects to home
    router.push('/');
  };

  const getErrorMessage = (error: string | null) => {
    if (!error) return 'An error occurred during authentication.';

    if (error.includes('400')) {
      return 'Authentication request error. Please try logging in again.';
    }

    if (error.includes('401')) {
      return 'Unauthorized. Your credentials may have expired.';
    }

    if (error.includes('Request failed')) {
      return 'Communication failure with the server. Check your connection and try again.';
    }

    return `Authentication error: ${error}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">{getErrorMessage(error)}</p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleReturnHome}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Home
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">If the problem persists, contact support.</p>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-sm font-medium text-red-800">Debug Info:</h3>
            <p className="mt-1 text-xs text-red-700 font-mono break-all">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
