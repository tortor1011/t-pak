import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS middleware for the Owner app.
 *
 * Allows cross-origin requests from the Tenant app (localhost:3001)
 * to access /api/tenant/* endpoints.
 */

/**
 * Build the list of allowed CORS origins from the environment.
 * Called once at module load time — environment variables must be set
 * before the application starts (standard Next.js requirement).
 */
function resolveAllowedOrigins(): string[] {
  const origins = ['http://localhost:3001', 'http://127.0.0.1:3001'];
  const tenantAppUrl = process.env.TENANT_APP_URL;
  if (tenantAppUrl) {
    try {
      const url = new URL(tenantAppUrl);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        // Use the normalised origin (scheme + host + port) to avoid trailing slashes
        origins.push(url.origin);
      }
    } catch {
      console.warn(
        '[middleware] TENANT_APP_URL is malformed and will be ignored for CORS. ' +
          `Value: "${tenantAppUrl}"`
      );
    }
  }
  return origins;
}

const ALLOWED_ORIGINS = resolveAllowedOrigins();

function getCorsHeaders(origin: string | null): HeadersInit {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  // Add CORS headers to all /api/tenant/* responses
  const response = NextResponse.next();
  const corsHeaders = getCorsHeaders(origin);
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: '/api/tenant/:path*',
};
