import { auth } from '@/lib/auth';
import type { UserRole } from '@/generated/prisma';
import { NextResponse } from 'next/server';

/**
 * Get the current authenticated session or return a 401 response.
 * Use in API Route Handlers.
 */
export async function getSessionOrThrow() {
  const session = await auth();
  if (!session?.user) {
    throw NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }
  return session;
}

/**
 * Require a specific role. Returns 403 if the user doesn't have the required role.
 * Use in API Route Handlers.
 *
 * @example
 * ```ts
 * export async function GET() {
 *   const session = await requireRole('ADMIN');
 *   // ... only admins reach here
 * }
 * ```
 */
export async function requireRole(role: UserRole) {
  const session = await getSessionOrThrow();
  if (session.user.role !== role) {
    throw NextResponse.json(
      { error: 'Forbidden: Insufficient permissions' },
      { status: 403 },
    );
  }
  return session;
}

/**
 * Get the current session for use in Server Components.
 * Returns null if not authenticated (does not throw).
 */
export async function getServerSession() {
  return await auth();
}
