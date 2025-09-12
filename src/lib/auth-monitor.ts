import type { signOut as SignOutType } from 'next-auth/react';

interface AuthState {
  isAuthenticated: boolean;
  token?: string;
}

let authCheckInterval: NodeJS.Timeout | null = null;
let localStorageWatcher: NodeJS.Timeout | null = null;
let isCheckingAuth = false;
let lastOAuthTokens = { oauth_token: '', oauth_token_secret: '' };

// Function to import signOut dynamically
const getSignOut = async (): Promise<typeof SignOutType> => {
  const { signOut } = await import('next-auth/react');
  return signOut;
};

// Function to check if the token is still valid by making a test request
const checkTokenValidity = async (token: string): Promise<boolean> => {
  try {
    // Make a simple request to check if the token is still valid
    const response = await fetch('/api/check-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ token }),
    });

    // If it returns 401 with "Invalid token.", the token has expired
    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));
      return !(data.detail === 'Invalid token.' || data.shouldLogout === true);
    }

    return response.ok;
  } catch (error) {
    console.error('Erro ao verificar validade do token:', error);
    return false;
  }
};

// Function to check for changes in OAuth tokens
const checkOAuthTokensChange = (): boolean => {
  if (typeof window === 'undefined') return false;

  const currentTokens = {
    oauth_token: localStorage.getItem('oauth_token') || '',
    oauth_token_secret: localStorage.getItem('oauth_token_secret') || '',
  };

  // If both tokens were removed (were present and now absent)
  const werePresent = lastOAuthTokens.oauth_token || lastOAuthTokens.oauth_token_secret;
  const areNowAbsent = !currentTokens.oauth_token && !currentTokens.oauth_token_secret;

  if (werePresent && areNowAbsent) {
    console.warn('🔍 Tokens OAuth removidos detectados - forçando logout');
    return true;
  }

  // Update the state of the tokens
  lastOAuthTokens = currentTokens;
  return false;
};

// Function to initialize the state of the OAuth tokens
const initializeOAuthTokensState = () => {
  if (typeof window === 'undefined') return;

  lastOAuthTokens = {
    oauth_token: localStorage.getItem('oauth_token') || '',
    oauth_token_secret: localStorage.getItem('oauth_token_secret') || '',
  };
};

// Function to completely clear the application state
const clearApplicationState = (preserveOAuthTokens = false) => {
  if (typeof window === 'undefined') return;

  try {
    if (!preserveOAuthTokens) {
      // Only remove OAuth tokens if not preserving
      // (preserves during logout to allow new login)
      localStorage.removeItem('oauth_token');
      localStorage.removeItem('oauth_token_secret');
    }

    // Clear other authentication data that may exist
    localStorage.removeItem('nextauth.message');
    localStorage.removeItem('token');

    // Clear sessionStorage (but preserves if in login process)
    const isInLoginProcess =
      window.location.pathname.includes('/oauth') || window.location.search.includes('oauth_token');

    if (!isInLoginProcess) {
      sessionStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing application state:', error);
  }
};

// Function to check if we are in an OAuth login process
const isInOAuthLoginProcess = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    window.location.pathname.includes('/oauth') ||
    window.location.search.includes('oauth_token') ||
    window.location.search.includes('oauth_verifier')
  );
};

// Function to force logout
const forceLogout = async (reason: string) => {
  if (isCheckingAuth || typeof window === 'undefined') return; // Prevent loops

  isCheckingAuth = true;
  console.warn(`Logout forçado: ${reason}`);

  try {
    // First stop the monitoring
    stopAuthMonitoring();

    // If not in an OAuth login process, clear the OAuth tokens as well
    const preserveOAuthTokens = isInOAuthLoginProcess();
    clearApplicationState(preserveOAuthTokens);

    // Import and use signOut dynamically
    const signOut = await getSignOut();
    await signOut({
      redirect: false,
    });

    // Small delay to ensure signOut completed
    await new Promise(resolve => setTimeout(resolve, 500));

    // Redirect to the home page
    window.location.href = '/';
  } catch (error) {
    console.error('Error during forced logout:', error);

    // If there's an error, clear everything and force redirect
    clearApplicationState(false); // Don't preserve tokens in case of error
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  } finally {
    // Reset the flag after a longer delay
    setTimeout(() => {
      isCheckingAuth = false;
    }, 2000);
  }
};

// Start authentication monitoring
export const startAuthMonitoring = (authState: AuthState) => {
  // For any previous monitoring
  stopAuthMonitoring();

  if (!authState.isAuthenticated || !authState.token) {
    return;
  }

  // Initialize the state of the OAuth tokens
  initializeOAuthTokensState();

  // Monitor changes in OAuth tokens every 2 seconds
  localStorageWatcher = setInterval(() => {
    if (isCheckingAuth) return;

    const tokensRemoved = checkOAuthTokensChange();
    if (tokensRemoved) {
      forceLogout('OAuth tokens removed from localStorage');
    }
  }, 2000); // 2 seconds for quick detection

  // Check the validity of the token every 30 seconds
  authCheckInterval = setInterval(async () => {
    if (isCheckingAuth) return;

    try {
      const isValid = await checkTokenValidity(authState.token!);

      if (!isValid) {
        await forceLogout('Invalid token detected in monitoring');
      }
    } catch (error) {
      console.error('Error during periodic token check:', error);
    }
  }, 30000); // 30 seconds
};

// Stop authentication monitoring
export const stopAuthMonitoring = () => {
  if (authCheckInterval) {
    clearInterval(authCheckInterval);
    authCheckInterval = null;
  }

  if (localStorageWatcher) {
    clearInterval(localStorageWatcher);
    localStorageWatcher = null;
  }
};

// Function to test forced logout (useful for development)
export const testTokenExpiration = async () => {
  await forceLogout('Testing token expiration');
};

// Function to manually clear the state (useful for development)
export const clearAuthState = () => {
  clearApplicationState(false); // Remove everything, including OAuth tokens
};

// Function to simulate OAuth token removal (for testing)
export const simulateTokenRemoval = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('oauth_token');
    localStorage.removeItem('oauth_token_secret');
  }
};

// Add global functions for testing in the console (only in the client)
if (typeof window !== 'undefined') {
  (window as any).testTokenExpiration = testTokenExpiration;
  (window as any).clearAuthState = clearAuthState;
  (window as any).simulateTokenRemoval = simulateTokenRemoval;
}
