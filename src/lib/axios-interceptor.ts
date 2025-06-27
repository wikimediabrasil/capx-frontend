import axios from "axios";

// Global axios interceptor setup
let isLoggedOut = false; // Flag to prevent multiple simultaneous logouts

// Function to check if we are in an OAuth login process
const isInOAuthLoginProcess = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.location.pathname.includes('/oauth') || 
         window.location.search.includes('oauth_token') ||
         window.location.search.includes('oauth_verifier');
};

// Function to import signOut dynamically
const getSignOut = async () => {
  try {
    const { signOut } = await import("next-auth/react");
    return signOut;
  } catch (error) {
    console.error("Erro ao importar signOut:", error);
    return null;
  }
};

const setupAxiosInterceptor = () => {
  // Global axios interceptor for all axios instances
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Check if it's a 401 (Unauthorized) error
      if (error.response?.status === 401) {
        const responseData = error.response?.data;
        const isInvalidToken = responseData?.detail === 'Invalid token.' || 
                              responseData?.shouldLogout === true ||
                              (responseData?.error === 'Token expirado' && responseData?.shouldLogout === true);
        
        // If the response indicates token expired and we're on the client side
        if (isInvalidToken && typeof window !== "undefined" && !isLoggedOut) {
          isLoggedOut = true; // Prevent multiple simultaneous logouts
          
          console.warn("Token expirado detectado. Fazendo logout automático...");
          
          try {
            // Clear localStorage but preserve OAuth tokens if in login process
            const preserveOAuthTokens = isInOAuthLoginProcess();
            
            if (!preserveOAuthTokens) {
              // Clear localStorage if there are stored tokens
              localStorage.removeItem("oauth_token");
              localStorage.removeItem("oauth_token_secret");
            }
            
            // Clear other auth data
            localStorage.removeItem("nextauth.message");
            localStorage.removeItem("token");
            
            // Importa signOut dinamicamente
            const signOut = await getSignOut();
            if (signOut) {
              await signOut({ 
                redirect: true, 
                callbackUrl: "/" 
              });
            } else {
              // Fallback se não conseguir importar signOut
              window.location.href = "/";
            }
          } catch (signOutError) {
            console.error("Erro durante logout automático:", signOutError);
            // If signOut fails, manually redirect
            window.location.href = "/";
          } finally {
            // Reset the flag after a small delay to allow the logout
            setTimeout(() => {
              isLoggedOut = false;
            }, 1000);
          }
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// Function to check if an error is a token expired error
export const isTokenExpiredError = (error: any): boolean => {
  return error?.response?.status === 401 && 
         (error?.response?.data?.detail === 'Invalid token.' ||
          error?.response?.data?.shouldLogout === true ||
          (error?.response?.data?.error === 'Token expirado' && error?.response?.data?.shouldLogout === true));
};

export default setupAxiosInterceptor; 