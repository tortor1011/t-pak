import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

const LOCAL_ALLOWED_ORIGINS = ['http://localhost:3001', 'http://127.0.0.1:3001'];
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ─── Public routes (no auth required) ─────────────────────────
const PUBLIC_PATHS = ['/login', '/register', '/api/auth'];
// Routes that belong to the tenant API (CORS-only, no owner auth check)
const TENANT_API_PREFIX = '/api/tenant';

/**
 * Build the list of allowed CORS origins from the environment.
 * Called once at module load time.
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  const ownerOrigin = request.nextUrl.origin;

  // ── 1. Tenant API routes: CORS only, no Owner auth check ──────
  if (pathname.startsWith(TENANT_API_PREFIX)) {
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

  // ── 2. Public paths: allow through without auth ───────────────
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // ── 3. Static assets / Next.js internals: allow through ───────
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|woff2?|ttf|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // ── 4. Auth.js session check for all other routes ─────────────
  const session = await auth();

  if (!session?.user) {
    // Not logged in → redirect to /login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in → allow through
  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

