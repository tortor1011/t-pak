import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/tenant/auth/login
 *
 * Validates tenant credentials. Returns either:
 * - Full session (linked: true) if the user has a room assigned
 * - Partial session (linked: false) if the user registered but not yet linked to a room
 *
 * Body: { email: string, password: string }
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

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: {
          include: { room: { select: { number: true, id: true } } },
        },
      },
    });

    if (!user || user.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'ไม่พบบัญชีผู้ใช้ หรือบัญชีนี้ไม่ใช่ลูกหอ' },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 },
      );
    }

    // Unlinked user — registered but not yet linked to a room
    if (!user.tenant) {
      return NextResponse.json({
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        linked: false,
      });
    }

    // Fully linked user
    return NextResponse.json({
      userId: user.id,
      tenantId: user.tenant.id,
      roomId: user.tenant.roomId,
      roomNumber: user.tenant.room.number,
      fullName: user.fullName,
      email: user.email,
      linked: true,
    });
  } catch (error) {
    console.error('Tenant login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
