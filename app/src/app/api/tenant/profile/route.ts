import { NextRequest, NextResponse } from 'next/server';
import { authenticateTenant } from '@/lib/tenant-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/tenant/profile
 *
 * Returns the authenticated tenant's lease info, room details,
 * and vehicle registration — used by the Tenant Profile page.
 */
export async function GET(request: NextRequest) {
  try {
    const tenant = await authenticateTenant(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantRecord = await prisma.tenant.findUnique({
      where: { id: tenant.tenantId },
      include: {
        user: {
          select: { fullName: true, phone: true, lineId: true },
        },
        room: {
          select: { number: true },
        },
      },
    });

    if (!tenantRecord) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({
      tenantName: tenantRecord.user.fullName,
      roomNumber: tenantRecord.room.number,
      startDate: tenantRecord.moveInDate.toISOString().split('T')[0],
      endDate: tenantRecord.contractEnd.toISOString().split('T')[0],
      depositAmount: tenantRecord.securityDeposit,
      vehiclePlate: tenantRecord.vehiclePlate,
      phone: tenantRecord.user.phone,
      lineId: tenantRecord.user.lineId,
    });
  } catch (error) {
    console.error('Error fetching tenant profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 },
    );
  }
}
