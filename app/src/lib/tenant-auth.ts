/**
 * Tenant authentication utilities for cross-origin API access.
 *
 * The Tenant app (running on :3001) authenticates via JWT Bearer token
 * against the Owner's /api/tenant/* endpoints.
 *
 * Flow:
 * 1. Tenant app's proxy calls Owner with `Authorization: Bearer <jwt>`
 * 2. Owner verifies the JWT using the shared SESSION_SECRET
 * 3. Owner looks up the tenant record from the userId in the JWT payload
 * 4. Returns tenant-scoped data (room, bills, etc.)
 *
 * The JWT is issued by the Tenant app's own /api/auth/login route handler
 * and stored as an HttpOnly cookie — credentials never leave the server.
 */

import 'server-only';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

export interface AuthenticatedTenant {
  userId: string;
  tenantId: string;
  roomId: string;
  roomNumber: string;
  fullName: string;
  email: string;
}

/** Shape of the JWT payload issued by the Tenant app session layer. */
interface TenantJwtPayload {
  sub: string;       // userId
  email: string;
  fullName: string;
  linked: boolean;
  tenantId?: string;
  roomId?: string;
  roomNumber?: string;
}

/**
 * Returns the JWT signing secret as a Uint8Array for use with jose.
 * Throws at runtime if SESSION_SECRET is not configured — fail fast.
 */
function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      '[tenant-auth] SESSION_SECRET env var must be set and at least 32 characters long.'
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Authenticate a tenant from the Authorization header.
 *
 * Accepts: `Authorization: Bearer <signed-jwt>`
 *
 * The JWT is verified against SESSION_SECRET (shared with the Tenant app).
 * After verification, the tenant record is fetched from the DB using the
 * userId in the JWT `sub` claim to ensure the tenant still exists and is
 * linked to a room (prevents stale sessions from accessing data after
 * a tenant record is removed).
 *
 * Returns null (not a throw) so callers can return a clean 401.
 */
export async function authenticateTenant(
  request: Request
): Promise<AuthenticatedTenant | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  if (authHeader.startsWith('Bearer ')) {
    return authenticateBearer(authHeader.slice(7).trim());
  }

  // Basic Auth is no longer accepted. Return null so the caller returns 401.
  // Kept as a named branch (not a wildcard) for clarity during migration.
  return null;
}

async function authenticateBearer(
  token: string
): Promise<AuthenticatedTenant | null> {
  if (!token) return null;

  try {
    const secret = getSessionSecret();
    const { payload } = await jwtVerify<TenantJwtPayload>(token, secret, {
      algorithms: ['HS256'],
    });

    // JWT must represent a fully linked tenant
    if (!payload.sub || !payload.linked || !payload.tenantId || !payload.roomId) {
      return null;
    }

    // Re-validate against DB: ensures the tenant record still exists and
    // the room association hasn't changed since the token was issued.
    // This is the authoritative ownership check — the JWT alone is not enough.
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: payload.tenantId,
        userId: payload.sub,      // must match — prevents tenantId substitution
        roomId: payload.roomId,   // must match — prevents roomId substitution
      },
      include: {
        room: { select: { id: true, number: true } },
      },
    });

    if (!tenant) return null;

    return {
      userId: payload.sub,
      tenantId: tenant.id,
      roomId: tenant.roomId,
      roomNumber: tenant.room.number,
      fullName: payload.fullName,
      email: payload.email,
    };
  } catch {
    // jwtVerify throws on expired, tampered, or invalid tokens — treat as unauth
    return null;
  }
}
