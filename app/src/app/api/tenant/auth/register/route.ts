import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

/**
 * POST /api/tenant/auth/register
 *
 * Creates a new User account with TENANT role.
 * The account is "unlinked" — no Tenant/Room record yet.
 * After registration, the user must call /api/tenant/auth/link
 * with an invite code to connect to their room.
 *
 * Response:
 *  { userId, fullName, email, linked: false }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password, fullName, phone } = validation.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone: phone ?? null,
        role: 'TENANT',
      },
    });

    return NextResponse.json(
      {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        linked: false,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
