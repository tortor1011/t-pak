import { NextRequest, NextResponse } from 'next/server';
import { authenticateTenant } from '@/lib/tenant-auth';

/**
 * POST /api/tenant/auth/login
 *
 * Validates tenant credentials and returns tenant profile info.
 * The Tenant app stores the credentials locally for subsequent API calls.
 *
 * Body: { email: string, password: string }
 * Response: { userId, tenantId, roomId, roomNumber, fullName, email }
 *
 * TODO: Replace with LINE Login flow for production.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    // Create a mock request with Basic auth header to reuse authenticateTenant
    const basicAuth = Buffer.from(`${email}:${password}`).toString('base64');
    const mockHeaders = new Headers();
    mockHeaders.set('Authorization', `Basic ${basicAuth}`);
    const mockRequest = new Request('http://localhost', { headers: mockHeaders });

    const tenant = await authenticateTenant(mockRequest);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid credentials or user is not a tenant' },
        { status: 401 },
      );
    }

    return NextResponse.json({
      userId: tenant.userId,
      tenantId: tenant.tenantId,
      roomId: tenant.roomId,
      roomNumber: tenant.roomNumber,
      fullName: tenant.fullName,
      email: tenant.email,
    });
  } catch (error) {
    console.error('Tenant login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
