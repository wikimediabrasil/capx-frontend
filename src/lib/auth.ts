import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {},
      async authorize(credentials: any) {
        const requestId = Math.random().toString(36).substring(7);
        try {

          // Validate required credentials - return null for silent failure
          if (!credentials.oauth_token || !credentials.oauth_verifier || !credentials.stored_token_secret) {
            console.warn(`[${requestId}] Missing required OAuth credentials - returning null for silent failure`);
            return null;
          }

          const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
                    
          // Try the login callback with retry logic
          let response;
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              
              response = await axios.post(`${baseUrl}/api/login/callback`, {
                oauth_token: credentials.oauth_token,
                oauth_verifier: credentials.oauth_verifier,
                stored_token_secret: credentials.stored_token_secret,
              });

              if (response.data.success && response.data.user) {
                return {
                  id: response.data.user.id,
                  name: response.data.user.username,
                  token: response.data.user.token,
                  first_login: response.data.user.first_login,
                };
              }

              console.warn(`[${requestId}] Invalid response from server:`, response.data);
              
            } catch (error: any) {
              console.error(`[${requestId}] Attempt ${attempt} failed:`, error.response?.data || error.message);
              
              // If it's a 400 error, this might be because tokens were already used
              // Return null silently to let NextAuth handle it gracefully
              if (error.response?.status === 400) {
                console.warn(`[${requestId}] 400 error - tokens may have been consumed by another request, returning null`);
                return null;
              }
              
              // Wait before retrying (except on last attempt)
              if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              }
            }
          }
          
          // If we get here, all attempts failed
          console.warn(`[${requestId}] All authentication attempts failed, returning null`);
          return null;
          
        } catch (error: any) {
          console.error(`[${requestId}] NextAuth authorize error:`, error.response?.data || error.message);
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
