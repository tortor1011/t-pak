import { NextRequest, NextResponse } from 'next/server';

const LOCAL_ALLOWED_ORIGINS = ['http://localhost:3001', 'http://127.0.0.1:3001'];
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * CORS middleware for the Owner app.
 *
 * Allows cross-origin requests from the Tenant app
 * to access /api/tenant/* endpoints.
 */

/**
 * Build the list of allowed CORS origins from the environment.
 * Called once at module load time — environment variables must be set
 * before the application starts (standard Next.js requirement).
 */
function resolveAllowedOrigins(): string[] {
  const tenantAppUrl = process.env.TENANT_APP_URL?.trim();
  const origins = IS_PRODUCTION ? [] : [...LOCAL_ALLOWED_ORIGINS];

  if (tenantAppUrl) {
    try {
      const url = new URL(tenantAppUrl);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        origins.push(url.origin);
      }
    } catch {
      console.warn(
        '[middleware] TENANT_APP_URL is malformed and will be ignored for CORS. ' +
          `Value: "${tenantAppUrl}"`
      );
    }
  } else if (IS_PRODUCTION) {
    throw new Error('[middleware] TENANT_APP_URL is required in production.');
  }

  return [...new Set(origins)];
}

const ALLOWED_ORIGINS = resolveAllowedOrigins();

function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const ownerOrigin = request.nextUrl.origin;

  if (origin && origin !== ownerOrigin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

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
