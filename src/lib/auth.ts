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
        try {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const response = await axios.post(`${baseUrl}/api/login/callback`, {
            oauth_token: credentials.oauth_token,
            oauth_verifier: credentials.oauth_verifier,
            stored_token: credentials.stored_token,
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

          throw new Error('Invalid response from server');
        } catch (error: any) {
          console.error('NextAuth authorize error:', error);
          throw error;
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
      return !!user;
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
