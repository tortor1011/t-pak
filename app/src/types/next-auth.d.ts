/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: 'ADMIN' | 'TENANT';
  }

  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'TENANT';
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'TENANT';
  }
}
