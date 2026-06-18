import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/owner/tenants/[tenantId]/move-out
 *
 * Soft-delete: marks the tenant as FORMER and unlinks them from the room.
 * The room is set back to 'vacant' and the tenant record is preserved for
 * billing history and audit purposes.
 *
 * $transaction ensures all three updates are atomic — no partial state.
 *
 * ⚠️ NO HARD DELETES — billing history must remain intact.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { tenantId } = await params;

  // Pre-check outside transaction
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { room: true },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }
  if (tenant.status === 'former') {
    return NextResponse.json({ error: 'Tenant has already moved out' }, { status: 409 });
  }

  const roomId = tenant.roomId;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Mark tenant as former and record move-out date
      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          status: 'former',
          moveOutDate: new Date(),
          roomId: null, // unlink from room so room can be re-assigned
        },
      });

      // 2. Set room back to vacant (only if this tenant was the active occupant)
      if (roomId) {
        await tx.room.update({
          where: { id: roomId },
          data: {
            occupancy: 'vacant',
            billingStatus: 'none',
          },
        });
      }
    });

    return NextResponse.json({ success: true, tenantId, movedOutAt: new Date().toISOString() });
  } catch (error) {
    console.error('Move-out transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
