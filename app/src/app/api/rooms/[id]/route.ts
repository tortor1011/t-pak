import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mapBillingStatusToFrontend } from '@/lib/mappers';
import { getBills } from '@/lib/api/bills';

/**
 * GET /api/rooms/[id]
 *
 * Returns a single room with tenant info and billing history.
 * Used by the Room Detail page.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        tenant: {
          include: {
            user: { select: { fullName: true, avatar: true, phone: true, lineId: true } },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Fetch latest meter reading for this room
    const latestMeterReading = await prisma.meterReading.findFirst({
      where: { roomId: id },
      orderBy: { readingDate: 'desc' },
    });

    // Fetch billing history
    const bills = await getBills(id);

    return NextResponse.json({
      id: room.id,
      number: room.number,
      floor: room.floor,
      building: room.building,
      occupancy: room.occupancy,
      billingStatus: mapBillingStatusToFrontend(room.billingStatus),
      baseRent: room.baseRent,
      currentBill: room.currentBill,
      amenities: room.amenities,
      tenantId: room.tenant?.id ?? null,
      tenantName: room.tenant?.user?.fullName ?? null,
      tenantAvatar: room.tenant?.user?.avatar ?? null,
      tenantPhone: room.tenant?.user?.phone ?? null,
      tenantLineId: room.tenant?.user?.lineId ?? null,
      moveInDate: room.tenant?.moveInDate?.toISOString().split('T')[0] ?? null,
      contractEnd: room.tenant?.contractEnd?.toISOString().split('T')[0] ?? null,
      latestMeterReading: latestMeterReading
        ? {
            electricityPrevious: latestMeterReading.electricityPrevious,
            electricityCurrent: latestMeterReading.electricityCurrent,
            waterPrevious: latestMeterReading.waterPrevious,
            waterCurrent: latestMeterReading.waterCurrent,
            readingDate: latestMeterReading.readingDate.toISOString(),
          }
        : null,
      bills,
    });
  } catch (error) {
    console.error('Error fetching room detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}
