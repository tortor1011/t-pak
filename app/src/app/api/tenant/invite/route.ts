import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { randomBytes } from 'crypto';

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
 * Owner Check-in: creates a Tenant record (unlinked to a User account),
 * marks the Room as occupied, creates the initial MeterReading record,
 * and returns an invite code for the tenant to self-register via the Tenant app.
 *
 * All three DB writes are wrapped in a $transaction — atomic or nothing.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

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

  // Pre-check outside transaction (read-only)
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return NextResponse.json({ error: 'ไม่พบห้องพัก' }, { status: 404 });
  if (room.occupancy !== 'vacant') {
    return NextResponse.json({ error: 'ห้องนี้มีผู้เช่าอยู่แล้ว' }, { status: 409 });
  }

  // Check if an unlinked tenant record already exists for this room
  const existingTenant = await prisma.tenant.findUnique({ where: { roomId } });
  if (existingTenant) {
    if (!existingTenant.userId) {
      // Unlinked — just regenerate invite code
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
    return NextResponse.json({ error: 'ห้องนี้มีผู้เช่าแล้ว' }, { status: 409 });
  }

  const inviteCode = generateInviteCode(room.number);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant record
      const tenant = await tx.tenant.create({
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
          status: 'active',
        },
      });

      // 2. Mark room as occupied
      await tx.room.update({
        where: { id: roomId },
        data: { occupancy: 'occupied' },
      });

      // 3. Create initial MeterReading so meter-reading page shows correct starting values.
      //    previous = current = initial reading (no usage yet on move-in day)
      await tx.meterReading.create({
        data: {
          roomId,
          electricityPrevious: initialMeterElectricity,
          electricityCurrent: initialMeterElectricity,
          waterPrevious: initialMeterWater,
          waterCurrent: initialMeterWater,
        },
      });

      return tenant;
    });

    return NextResponse.json(
      { inviteCode: result.inviteCode, tenantId: result.id, roomNumber: room.number },
      { status: 201 },
    );
  } catch (error) {
    console.error('Check-in transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
