import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deliveryRepository } from '@/repositories/server';

/**
 * GET /api/delivery
 *
 * Returns all delivery tasks, ordered by createdAt desc.
 * Used by the Owner parcel delivery queue page.
 */
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const result = await deliveryRepository.listDeliveryTasks();
  if (!result.ok) return NextResponse.json({ error: result.error.message }, { status: 500 });

  return NextResponse.json(result.value);
}
