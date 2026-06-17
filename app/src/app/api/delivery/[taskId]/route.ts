import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deliveryRepository } from '@/repositories/server';

/**
 * GET /api/delivery/[taskId]
 *
 * Returns a single delivery task by ID.
 * Used by the Owner delivery proof page.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { taskId } = await params;
  const result = await deliveryRepository.findDeliveryTaskById(taskId);
  if (!result.ok) return NextResponse.json({ error: result.error.message }, { status: 500 });
  if (!result.value) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(result.value);
}

/**
 * PATCH /api/delivery/[taskId]
 *
 * Transitions a delivery task:
 *   { action: 'start' }                                               → status: in-progress
 *   { action: 'complete', proofPhotoUrl?, deliveryNote?, confirmationChecked? } → status: delivered
 *
 * Returns the updated task.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { taskId } = await params;
  const body = await request.json();
  const { action, proofPhotoUrl, deliveryNote, confirmationChecked } = body;

  if (action === 'start') {
    const result = await deliveryRepository.startDeliveryTask(taskId);
    if (!result.ok) return NextResponse.json({ error: result.error.message }, { status: 500 });
    // Return the specific task (not the full list)
    const updated = result.value.find((t) => t.id === taskId) ?? null;
    return NextResponse.json(updated);
  }

  if (action === 'complete') {
    const result = await deliveryRepository.completeDeliveryTask(taskId, {
      proofPhotoUrl: proofPhotoUrl ?? null,
      deliveryNote: deliveryNote ?? null,
      confirmationChecked: confirmationChecked ?? false,
    });
    if (!result.ok) return NextResponse.json({ error: result.error.message }, { status: 500 });
    const updated = result.value.find((t) => t.id === taskId) ?? null;
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
