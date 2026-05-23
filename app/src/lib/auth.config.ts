import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/generated/prisma';

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: copy fields from the DB-fetched user object
      if (user) {
        token.id = user.id as string;
        token.role = user.role as UserRole;
        token.isOnboarded = user.isOnboarded;
      }
      // Client called update({ isOnboarded: true }) — rewrite the cookie value
      if (trigger === 'update' && session?.isOnboarded !== undefined) {
        token.isOnboarded = session.isOnboarded as boolean;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'TENANT';
        session.user.isOnboarded = token.isOnboarded as boolean;
      }
      return session;
    },
  },
  providers: [],
};