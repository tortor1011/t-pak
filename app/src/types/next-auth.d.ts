import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: 'ADMIN' | 'TENANT';
    isOnboarded: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'TENANT';
      isOnboarded: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'TENANT';
    isOnboarded: boolean;
  }
}
