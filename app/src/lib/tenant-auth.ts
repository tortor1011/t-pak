/**
 * Tenant authentication utilities for cross-origin API access.
 *
 * The Tenant app (running on :3001) authenticates via Basic Auth header
 * against the Owner's /api/tenant/* endpoints.
 *
 * Flow:
 * 1. Tenant app sends `Authorization: Basic base64(email:password)` header
 * 2. Owner validates credentials against the `users` table (role = TENANT)
 * 3. Returns tenant-scoped data (room, bills, etc.)
 *
 * TODO: Migrate to LINE Login for Thai dormitory standard auth flow.
 * TODO: Consider JWT tokens for production to avoid sending credentials on every request.
 */

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export interface AuthenticatedTenant {
  userId: string;
  tenantId: string;
  roomId: string;
  roomNumber: string;
  fullName: string;
  email: string;
}

/**
 * Authenticate an unlinked tenant (registered but not yet linked to a room).
 * Returns user info without tenantId/roomNumber for use in the /link endpoint.
 */
export interface AuthenticatedUser {
  userId: string;
  fullName: string;
  email: string;
  linked: false;
}

/**
 * Authenticate a tenant from the Authorization header.
 * Returns the tenant's profile or null if unauthorized.
 */
export async function authenticateTenant(
  request: Request
): Promise<AuthenticatedTenant | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  // Support both "Basic base64" and "Bearer token" (future-proof)
  if (authHeader.startsWith('Basic ')) {
    return authenticateBasic(authHeader.slice(6));
  }

  // TODO: Add Bearer token support for JWT-based auth
  return null;
}

async function authenticateBasic(
  base64Credentials: string
): Promise<AuthenticatedTenant | null> {
  try {
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const colonIdx = decoded.indexOf(':');
    if (colonIdx === -1) return null;
    const email = decoded.slice(0, colonIdx);
    const password = decoded.slice(colonIdx + 1);
    if (!email || !password) return null;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: {
          include: {
            room: { select: { id: true, number: true } },
          },
        },
      },
    });

    if (!user || user.role !== 'TENANT') return null;
    // Unlinked users cannot access protected tenant endpoints
    if (!user.tenant) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return {
      userId: user.id,
      tenantId: user.tenant.id,
      roomId: user.tenant.roomId,
      roomNumber: user.tenant.room.number,
      fullName: user.fullName,
      email: user.email,
    };
  } catch {
    return null;
  }
}
