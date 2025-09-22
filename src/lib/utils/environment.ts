/**
 * Environment utility functions to handle different deployment environments
 */

export type Environment = 'local' | 'test' | 'production';

/**
 * Detects the current environment based on the URL or NODE_ENV. It works both on server and client side.
 */
export function getCurrentEnvironment(): Environment {
  // Server-side check
  if (typeof window === 'undefined') {
    const nodeEnv = process.env.NODE_ENV;
    const nextAuthUrl = process.env.NEXTAUTH_URL;

    if (nextAuthUrl?.includes('capx.toolforge.org')) {
      return 'production';
    }
    if (nextAuthUrl?.includes('capx-test.toolforge.org')) {
      return 'test';
    }
    if (nodeEnv === 'production') {
      // Fallback: check if we're in production but don't have toolforge URL
      return 'production';
    }
    return 'local';
  }

  // Client-side check
  const hostname = window.location.hostname;

  if (hostname === 'capx.toolforge.org') {
    return 'production';
  }
  if (hostname === 'capx-test.toolforge.org') {
    return 'test';
  }

  return 'local';
}

/**
 * Gets the current app URL based on the environment
 */
export function getCurrentAppUrl(): string {
  const env = getCurrentEnvironment();

  switch (env) {
    case 'production':
      return process.env.NEXT_PUBLIC_APP_URL_PRODUCTION || 'https://capx.toolforge.org';
    case 'test':
      return process.env.NEXT_PUBLIC_APP_URL_TEST || 'https://capx-test.toolforge.org';
    case 'local':
    default:
      return process.env.NEXT_PUBLIC_APP_URL_LOCAL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }
}
