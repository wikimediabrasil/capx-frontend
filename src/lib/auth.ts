import axios from 'axios';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Cache to prevent multiple simultaneous calls with the same tokens
const tokenCache = new Map<string, { timestamp: number; result: any }>();
const CACHE_TTL = 5000; // 5 seconds TTL

// Clean up expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  tokenCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      tokenCache.delete(key);
    }
  });
}, CACHE_TTL);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {},
      async authorize(credentials: any) {
        const requestId = crypto.randomUUID();
        try {
          // Validate required credentials - return null for silent failure
          if (
            !credentials.oauth_token ||
            !credentials.oauth_verifier ||
            !credentials.stored_token_secret
          ) {
            console.warn(
              `[${requestId}] Missing required OAuth credentials - returning null for silent failure`
            );
            return null;
          }

          // Create a cache key from the tokens
          const cacheKey = `${credentials.oauth_token}:${credentials.oauth_verifier}:${credentials.stored_token_secret}`;

          // Check if we have a cached result for these exact tokens
          const cached = tokenCache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`[${requestId}] Using cached result for tokens`);
            return cached.result;
          }

          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

          // Try the login callback with single attempt (OAuth tokens are single-use)
          try {
            const response = await axios.post(`${baseUrl}/api/login/callback`, {
              oauth_token: credentials.oauth_token,
              oauth_verifier: credentials.oauth_verifier,
              stored_token_secret: credentials.stored_token_secret,
            });

            if (response.data.success && response.data.user) {
              console.log(`[${requestId}] Login successful`);
              const userData = {
                id: response.data.user.id,
                name: response.data.user.username,
                token: response.data.user.token,
                first_login: response.data.user.first_login,
              };

              // Cache the successful result
              tokenCache.set(cacheKey, {
                timestamp: Date.now(),
                result: userData,
              });

              return userData;
            }

            console.warn(`[${requestId}] Invalid response from server:`, response.data);
            return null;
          } catch (error: any) {
            console.error(
              `[${requestId}] Login attempt failed:`,
              error.response?.data || error.message
            );

            // If it's a 400 error, this might be because tokens were already used
            // Cache the failure to prevent multiple attempts with the same tokens
            if (error.response?.status === 400) {
              console.warn(
                `[${requestId}] 400 error - tokens may have been consumed by another request, caching failure and returning null`
              );

              // Cache the failure with a shorter TTL
              tokenCache.set(cacheKey, {
                timestamp: Date.now(),
                result: null,
              });

              return null;
            }

            // For other errors, also cache the failure to prevent multiple attempts
            console.warn(`[${requestId}] Caching failure for other error types`);
            tokenCache.set(cacheKey, {
              timestamp: Date.now(),
              result: null,
            });

            return null;
          }
        } catch (error: any) {
          console.error(
            `[${requestId}] NextAuth authorize error:`,
            error.response?.data || error.message
          );
          console.error(`[${requestId}] Error status:`, error.response?.status);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user }) {
      // Accept any successful authentication
      const isValid = !!user;
      return isValid;
    },
    async session({ session, token }) {
      session.user = token.user as any;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
};
