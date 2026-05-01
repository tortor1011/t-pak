import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';

// Simple random code generator: e.g. "ROOM101-A4B2"
function generateInviteCode(roomNumber: string): string {
  const suffix = randomBytes(2).toString('hex').toUpperCase();
  return `ROOM${roomNumber.replace(/\s/g, '')}-${suffix}`;
}

const inviteSchema = z.object({
  roomId: z.string(),
  moveInDate: z.string(),
  contractEnd: z.string(),
  contractDuration: z.string().default('1-year'),
  baseRent: z.number(),
  securityDeposit: z.number(),
  initialMeterElectricity: z.number().default(0),
  initialMeterWater: z.number().default(0),
});

/**
 * POST /api/tenant/invite
 *
 * Called by the Owner Move-In form to create a Tenant record
 * without a User (unlinked). Generates an invite code that the
 * physical tenant uses to self-register via the Tenant app.
 *
 * Response: { inviteCode, tenantId, roomNumber }
 *
 * NOTE: This endpoint is Owner-authenticated (via session cookie in the
 * future). For now it is unprotected — acceptable for MVP prototype.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = inviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const {
      roomId,
      moveInDate,
      contractEnd,
      contractDuration,
      baseRent,
      securityDeposit,
      initialMeterElectricity,
      initialMeterWater,
    } = validation.data;

    // Verify room exists and is vacant
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: 'ไม่พบห้องพัก' }, { status: 404 });
    }
    if (room.occupancy !== 'vacant') {
      return NextResponse.json(
        { error: 'ห้องนี้มีผู้เช่าอยู่แล้ว' },
        { status: 409 },
      );
    }

    // Check if an unlinked tenant record already exists for this room
    const existingTenant = await prisma.tenant.findUnique({ where: { roomId } });
    if (existingTenant) {
      // If unlinked, regenerate invite code
      if (!existingTenant.userId) {
        const newCode = generateInviteCode(room.number);
        const updated = await prisma.tenant.update({
          where: { id: existingTenant.id },
          data: { inviteCode: newCode },
        });
        return NextResponse.json({
          inviteCode: updated.inviteCode,
          tenantId: updated.id,
          roomNumber: room.number,
        });
      }
      return NextResponse.json(
        { error: 'ห้องนี้มีผู้เช่าแล้ว' },
        { status: 409 },
      );
    }

    const inviteCode = generateInviteCode(room.number);

    const tenant = await prisma.tenant.create({
      data: {
        roomId,
        inviteCode,
        contractDuration,
        moveInDate: new Date(moveInDate),
        contractEnd: new Date(contractEnd),
        baseRent,
        securityDeposit,
        initialMeterElectricity,
        initialMeterWater,
      },
    });

    // Mark room as occupied
    await prisma.room.update({
      where: { id: roomId },
      data: { occupancy: 'occupied' },
    });

    return NextResponse.json(
      {
        inviteCode: tenant.inviteCode,
        tenantId: tenant.id,
        roomNumber: room.number,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
