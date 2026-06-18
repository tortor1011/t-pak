import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { MeterReading } from '@/types/billing';
import type { MeterReadingSubmission } from '@/repositories/billing/types';

/**
 * GET /api/meter-readings
 *
 * Returns meter reading data for every occupied room.
 * Queries from Room (not MeterReading) so rooms without any reading record
 * are still included — using the tenant's initialMeter* as the previous value.
 */
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rooms = await prisma.room.findMany({
    where: { occupancy: 'occupied' },
    include: {
      tenant: true,
      meterReadings: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: [{ floor: 'asc' }, { number: 'asc' }],
  });

  const items: MeterReading[] = rooms.map((room) => {
    const latest = room.meterReadings[0] ?? null;

    // Fallback to tenant's initial reading, then 0 if no tenant record exists
    const initElectricity = room.tenant?.initialMeterElectricity ?? 0;
    const initWater = room.tenant?.initialMeterWater ?? 0;

    return {
      roomId: room.id,
      roomNumber: room.number,
      building: room.building,
      floor: room.floor,
      electricity: {
        previous: latest?.electricityPrevious ?? initElectricity,
        current: latest?.electricityCurrent ?? null,
      },
      water: {
        previous: latest?.waterPrevious ?? initWater,
        current: latest?.waterCurrent ?? null,
      },
    };
  });

  return NextResponse.json(items);
}

/**
 * POST /api/meter-readings
 *
 * Saves current meter readings for multiple rooms.
 * Body: { readings: MeterReadingSubmission[] }
 *
 * - Room with existing MeterReading record → update electricityCurrent / waterCurrent
 * - Room with no MeterReading record yet → create a new record using tenant's initial values as previous
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const readings: MeterReadingSubmission[] = body.readings;

  if (!Array.isArray(readings) || readings.length === 0) {
    return NextResponse.json({ error: 'At least one reading is required.' }, { status: 400 });
  }

  // Load all involved rooms in one query
  const roomIds = readings.map((r) => r.roomId);
  const rooms = await prisma.room.findMany({
    where: { id: { in: roomIds } },
    include: {
      tenant: true,
      meterReadings: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  for (const reading of readings) {
    const room = roomMap.get(reading.roomId);
    if (!room) {
      return NextResponse.json({ error: `Room ${reading.roomId} not found.` }, { status: 404 });
    }

    const latest = room.meterReadings[0] ?? null;

    if (latest) {
      // Update existing record's current values
      await prisma.meterReading.update({
        where: { id: latest.id },
        data: {
          electricityCurrent: reading.electricityCurrent,
          waterCurrent: reading.waterCurrent,
        },
      });
    } else {
      // No record yet — create one, using tenant's initial reading as "previous"
      const prevElectricity = room.tenant?.initialMeterElectricity ?? 0;
      const prevWater = room.tenant?.initialMeterWater ?? 0;

      await prisma.meterReading.create({
        data: {
          roomId: room.id,
          electricityPrevious: prevElectricity,
          electricityCurrent: reading.electricityCurrent,
          waterPrevious: prevWater,
          waterCurrent: reading.waterCurrent,
        },
      });
    }
  }

  // Return the updated list (re-run GET logic)
  const updatedRooms = await prisma.room.findMany({
    where: { occupancy: 'occupied' },
    include: {
      tenant: true,
      meterReadings: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: [{ floor: 'asc' }, { number: 'asc' }],
  });

  const result: MeterReading[] = updatedRooms.map((room) => {
    const latest = room.meterReadings[0] ?? null;
    const initElectricity = room.tenant?.initialMeterElectricity ?? 0;
    const initWater = room.tenant?.initialMeterWater ?? 0;
    return {
      roomId: room.id,
      roomNumber: room.number,
      building: room.building,
      floor: room.floor,
      electricity: {
        previous: latest?.electricityPrevious ?? initElectricity,
        current: latest?.electricityCurrent ?? null,
      },
      water: {
        previous: latest?.waterPrevious ?? initWater,
        current: latest?.waterCurrent ?? null,
      },
    };
  });

  return NextResponse.json(result);
}
