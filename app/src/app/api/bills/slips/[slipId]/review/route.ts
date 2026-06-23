import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { serverRepositories } from '@/repositories/server';

const reviewSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
});

/**
 * PATCH /api/bills/slips/[slipId]/review
 *
 * Owner reviews a payment slip.
 * - approved: marks bill as 'paid', updates room billingStatus to 'paid'
 * - rejected: leaves bill status unchanged, slip decision set to 'rejected'
 *
 * Returns the updated slip queue so the UI can refresh without a full page reload.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slipId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = reviewSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { slipId } = await params;
  const result = await serverRepositories.billingRepository.reviewSlipVerification(
    slipId,
    validation.data.decision
  );

  if (!result.ok) {
    const status = result.error.code === 'NOT_FOUND' ? 404 : 500;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json(result.value);
}
