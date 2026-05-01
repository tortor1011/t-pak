import { NextRequest, NextResponse } from 'next/server';
import { authenticateTenant } from '@/lib/tenant-auth';
import { prisma } from '@/lib/prisma';
import { mapComplaintStatusToFrontend, mapComplaintStatusToPrisma, dateToISOString } from '@/lib/mappers';
import { z } from 'zod';
import type { ComplaintCategory as PrismaComplaintCategory } from '@/generated/prisma';

/**
 * GET /api/tenant/complaints — List complaints for the tenant's room.
 * POST /api/tenant/complaints — Submit a new complaint/maintenance request.
 */

const createComplaintSchema = z.object({
  category: z.enum(['plumbing', 'electrical', 'furniture', 'cleaning', 'noise', 'appliance', 'other']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  photoUrl: z.string().nullable().optional(),
  permissionToEnter: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const tenant = await authenticateTenant(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const complaints = await prisma.complaint.findMany({
      where: { roomId: tenant.roomId },
      include: { room: { select: { number: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const items = complaints.map((c) => ({
      id: c.id,
      roomNumber: c.room.number,
      tenantName: tenant.fullName,
      title: c.title,
      category: c.category,
      description: c.description,
      photoUrl: c.photoUrl,
      permissionToEnter: c.permissionToEnter,
      status: mapComplaintStatusToFrontend(c.status),
      createdAt: c.createdAt.toISOString(),
      resolvedAt: dateToISOString(c.resolvedAt),
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching tenant complaints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
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
    const validation = createComplaintSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const data = validation.data;

    const complaint = await prisma.complaint.create({
      data: {
        roomId: tenant.roomId,
        category: data.category as PrismaComplaintCategory,
        title: data.title,
        description: data.description,
        photoUrl: data.photoUrl ?? null,
        permissionToEnter: data.permissionToEnter,
        status: 'new_ticket',
      },
      include: { room: { select: { number: true } } },
    });

    return NextResponse.json(
      {
        id: complaint.id,
        roomNumber: complaint.room.number,
        tenantName: tenant.fullName,
        title: complaint.title,
        category: complaint.category,
        description: complaint.description,
        photoUrl: complaint.photoUrl,
        permissionToEnter: complaint.permissionToEnter,
        status: mapComplaintStatusToFrontend(complaint.status),
        createdAt: complaint.createdAt.toISOString(),
        resolvedAt: null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json(
      { error: 'Failed to create complaint' },
      { status: 500 },
    );
  }
}
