import axios from 'axios';

// Global axios interceptor setup
let isLoggedOut = false; // Flag to prevent multiple simultaneous logouts

// Function to check if we are in an OAuth login process
const isInOAuthLoginProcess = (): boolean => {
  if (typeof globalThis === 'undefined') return false;

  return (
    globalThis.location.pathname.includes('/oauth') ||
    globalThis.location.search.includes('oauth_token') ||
    globalThis.location.search.includes('oauth_verifier')
  );
};

// Function to import signOut dynamically
const getSignOut = async () => {
  try {
    const { signOut } = await import('next-auth/react');
    return signOut;
  } catch (error) {
    console.error('Erro ao importar signOut:', error);
    return null;
  }
};

const setupAxiosInterceptor = () => {
  // Global axios interceptor for all axios instances
  axios.interceptors.response.use(
    response => response,
    async error => {
      // Check if it's a 401 (Unauthorized) error
      if (error.response?.status === 401) {
        const responseData = error.response?.data;
        const isInvalidToken =
          responseData?.detail === 'Invalid token.' ||
          responseData?.shouldLogout === true ||
          (responseData?.error === 'Token expirado' && responseData?.shouldLogout === true);

        // If the response indicates token expired and we're on the client side
        if (isInvalidToken && typeof globalThis !== 'undefined' && !isLoggedOut) {
          isLoggedOut = true; // Prevent multiple simultaneous logouts

          console.warn('Token expirado detectado. Fazendo logout automático...');

          try {
            // Clear localStorage but preserve OAuth tokens if in login process
            const preserveOAuthTokens = isInOAuthLoginProcess();

            if (!preserveOAuthTokens) {
              // Clear localStorage if there are stored tokens
              localStorage.removeItem('oauth_token');
              localStorage.removeItem('oauth_token_secret');
            }

            // Clear other auth data
            localStorage.removeItem('nextauth.message');
            localStorage.removeItem('token');

            // Importa signOut dinamicamente
            const signOut = await getSignOut();
            if (signOut) {
              await signOut({
                redirect: true,
                callbackUrl: '/',
              });
            } else {
              // Fallback se não conseguir importar signOut
              globalThis.location.href = '/';
            }
          } catch (signOutError) {
            console.error('Erro durante logout automático:', signOutError);
            // If signOut fails, manually redirect
            if (typeof globalThis !== 'undefined') globalThis.location.href = '/';
          } finally {
            // Reset the flag after enough time for the redirect to complete
            setTimeout(() => {
              isLoggedOut = false;
            }, 5000);
          }
        }
      }

      throw error;
    }
  );
};

// Function to check if an error is a token expired error
export const isTokenExpiredError = (error: any): boolean => {
  return (
    error?.response?.status === 401 &&
    (error?.response?.data?.detail === 'Invalid token.' ||
      error?.response?.data?.shouldLogout === true ||
      (error?.response?.data?.error === 'Token expirado' &&
        error?.response?.data?.shouldLogout === true))
  );
};

export default setupAxiosInterceptor;
