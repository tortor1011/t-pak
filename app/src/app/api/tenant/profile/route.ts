import { NextRequest, NextResponse } from 'next/server';
import { authenticateTenant } from '@/lib/tenant-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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
      tenantName: tenantRecord.user?.fullName ?? '—',
      roomNumber: tenantRecord.room.number,
      startDate: tenantRecord.moveInDate.toISOString().split('T')[0],
      endDate: tenantRecord.contractEnd.toISOString().split('T')[0],
      depositAmount: tenantRecord.securityDeposit,
      vehiclePlate: tenantRecord.vehiclePlate,
      phone: tenantRecord.user?.phone ?? null,
      lineId: tenantRecord.user?.lineId ?? null,
    });
  } catch (error) {
    console.error('Error fetching tenant profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 },
    );
  }
}

const updateProfileSchema = z.object({
  vehiclePlate: z.string().nullable().optional(),
});

/**
 * PATCH /api/tenant/profile
 *
 * Updates the tenant's profile data (currently only vehiclePlate).
 */
export async function PATCH(request: NextRequest) {
  try {
    const tenant = await authenticateTenant(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { vehiclePlate } = validation.data;

    // Run in transaction to update both Tenant and Vehicle tables
    await prisma.$transaction(async (tx) => {
      // 1. Update Tenant record
      await tx.tenant.update({
        where: { id: tenant.tenantId },
        data: { vehiclePlate },
      });

      // 2. Sync with Vehicle table
      // If plate is empty/null, we could deactivate or delete. For now, we update if exists or create new if not empty.
      if (vehiclePlate) {
        const existingVehicle = await tx.vehicle.findFirst({
          where: { tenantId: tenant.tenantId, roomId: tenant.roomId },
        });

        if (existingVehicle) {
          await tx.vehicle.update({
            where: { id: existingVehicle.id },
            data: { plate: vehiclePlate },
          });
        } else {
          await tx.vehicle.create({
            data: {
              tenantId: tenant.tenantId,
              roomId: tenant.roomId,
              plate: vehiclePlate,
              status: 'unregistered',
            },
          });
        }
      }
    });

    // Fetch the updated profile to return
    const updatedTenantRecord = await prisma.tenant.findUnique({
      where: { id: tenant.tenantId },
      include: {
        user: { select: { fullName: true, phone: true, lineId: true } },
        room: { select: { number: true } },
      },
    });

    if (!updatedTenantRecord) {
      throw new Error('Failed to retrieve updated tenant');
    }

    return NextResponse.json({
      tenantName: updatedTenantRecord.user?.fullName ?? '—',
      roomNumber: updatedTenantRecord.room.number,
      startDate: updatedTenantRecord.moveInDate.toISOString().split('T')[0],
      endDate: updatedTenantRecord.contractEnd.toISOString().split('T')[0],
      depositAmount: updatedTenantRecord.securityDeposit,
      vehiclePlate: updatedTenantRecord.vehiclePlate,
      phone: updatedTenantRecord.user?.phone ?? null,
      lineId: updatedTenantRecord.user?.lineId ?? null,
    });
  } catch (error) {
    console.error('Error updating tenant profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
