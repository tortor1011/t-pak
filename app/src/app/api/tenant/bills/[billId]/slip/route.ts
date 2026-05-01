import { NextRequest, NextResponse } from 'next/server';
import { authenticateTenant } from '@/lib/tenant-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * POST /api/tenant/bills/[billId]/slip
 *
 * Upload a payment slip for a specific bill.
 * Sets the bill status to `pending_payment` and creates a SlipVerification record.
 *
 * CRITICAL LOGIC:
 * - Only the bill's room tenant can upload a slip
 * - Only `unpaid` or `overdue` bills can receive a slip
 * - Once uploaded, the Tenant UI hides the QR code (anti-duplicate payment)
 * - The Owner sees this slip in their Verification Queue
 */

const submitSlipSchema = z.object({
  slipUrl: z.string().min(1, 'slipUrl is required'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> }
) {
  try {
    const tenant = await authenticateTenant(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { billId } = await params;

    // Validate body
    const body = await request.json();
    const validation = submitSlipSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { slipUrl } = validation.data;

    // Fetch the bill and verify ownership
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { room: { select: { id: true, number: true } } },
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (bill.roomId !== tenant.roomId) {
      return NextResponse.json(
        { error: 'Forbidden: This bill belongs to a different room' },
        { status: 403 },
      );
    }

    // Only allow slip upload for unpaid/overdue bills
    if (!['unpaid', 'overdue'].includes(bill.status)) {
      return NextResponse.json(
        { error: `Cannot upload slip: bill status is '${bill.status}'` },
        { status: 409 },
      );
    }

    // Update bill status to pending_payment and set slipUrl
    await prisma.bill.update({
      where: { id: billId },
      data: {
        status: 'pending_payment',
        slipUrl,
      },
    });

    // Create SlipVerification record for the Owner's verification queue
    await prisma.slipVerification.create({
      data: {
        billId,
        slipUrl,
        detectedAmount: bill.totalAmount, // Auto-detect: use bill amount
        isAmountMatch: true,              // Will be verified by Owner
      },
    });

    // Update room billing status
    await prisma.room.update({
      where: { id: bill.roomId },
      data: { billingStatus: 'pending_payment' },
    });

    return NextResponse.json(
      { success: true, message: 'Slip uploaded. Pending verification.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error uploading slip:', error);
    return NextResponse.json(
      { error: 'Failed to upload slip' },
      { status: 500 },
    );
  }
}
