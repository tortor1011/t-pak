import { NextRequest, NextResponse } from 'next/server';
import { authenticateTenant } from '@/lib/tenant-auth';
import { prisma } from '@/lib/prisma';
import { mapDeliveryStatusToFrontend } from '@/lib/mappers';
import { z } from 'zod';

/**
 * GET /api/tenant/parcels — List delivery tasks for the tenant's room.
 * POST /api/tenant/parcels — Submit a new parcel delivery request.
 *
 * This replaces the Tenant app's localStorage bridge
 * (`deliveryTaskQueue.ts`). Now tasks go directly into PostgreSQL
 * and are immediately visible in the Owner's delivery queue.
 */

const createParcelSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  phone: z.string().min(1, 'Phone is required'),
  courierName: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const tenant = await authenticateTenant(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await prisma.deliveryTask.findMany({
      where: { roomId: tenant.roomId },
      include: { room: { select: { number: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const items = tasks.map((t) => ({
      id: t.id,
      tenantName: t.tenantName,
      roomNumber: t.room.number,
      trackingNumber: t.trackingNumber,
      phone: t.phone,
      courierName: t.courierName,
      status: mapDeliveryStatusToFrontend(t.status as 'pending' | 'in_progress' | 'delivered' | 'returned'),
      requestedAt: t.requestedAt.toISOString(),
      startedAt: t.startedAt?.toISOString() ?? null,
      deliveredAt: t.deliveredAt?.toISOString() ?? null,
      proofPhotoUrl: t.proofPhotoUrl,
      deliveryNote: t.deliveryNote,
      confirmationChecked: t.confirmationChecked,
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching tenant parcels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parcels' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await authenticateTenant(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createParcelSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const data = validation.data;

    const task = await prisma.deliveryTask.create({
      data: {
        roomId: tenant.roomId,
        tenantName: tenant.fullName,
        trackingNumber: data.trackingNumber,
        phone: data.phone,
        courierName: data.courierName ?? null,
        status: 'pending',
        requestedAt: new Date(),
        deliveryNote: data.notes ?? null,
      },
      include: { room: { select: { number: true } } },
    });

    return NextResponse.json(
      {
        id: task.id,
        tenantName: task.tenantName,
        roomNumber: task.room.number,
        trackingNumber: task.trackingNumber,
        phone: task.phone,
        courierName: task.courierName,
        status: 'pending',
        requestedAt: task.requestedAt.toISOString(),
        startedAt: null,
        deliveredAt: null,
        proofPhotoUrl: null,
        deliveryNote: task.deliveryNote,
        confirmationChecked: false,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating parcel request:', error);
    return NextResponse.json(
      { error: 'Failed to create parcel request' },
      { status: 500 },
    );
  }
}
