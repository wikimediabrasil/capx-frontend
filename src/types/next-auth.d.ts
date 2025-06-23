import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      token: string;
      username: string;
      first_login: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
