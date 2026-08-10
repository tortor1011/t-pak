import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { serverRepositories } from '@/repositories/server';
import { calculateBillingSummary } from '@/services/billingSummary';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const roomsResult = await serverRepositories.roomRepository.listRooms();
    if (!roomsResult.ok) {
      return NextResponse.json(
        { error: 'Failed to load rooms' },
        { status: 500 }
      );
    }

    const rooms = roomsResult.value;
    const ownerBillingAggregationResult = await serverRepositories.billingRepository.loadOwnerBillingAggregation(rooms);

    if (!ownerBillingAggregationResult.ok) {
      return NextResponse.json(
        { error: 'Failed to load billing aggregation' },
        { status: 500 }
      );
    }

    const slipQueueResult = await serverRepositories.billingRepository.loadSlipVerificationQueue();

    if (!slipQueueResult.ok) {
      return NextResponse.json(
        { error: 'Failed to load slip queue' },
        { status: 500 }
      );
    }

    const {
      pendingSlipCount,
      debtQueue,
      activeDebtQueue,
      totalOutstanding,
    } = ownerBillingAggregationResult.value;
    
    const summary = calculateBillingSummary(rooms);

    return NextResponse.json({
      rooms,
      summary,
      pendingSlipCount,
      slipQueue: slipQueueResult.value,
      debtQueue,
      activeDebtQueue,
      totalOutstanding,
    });
  } catch (error) {
    console.error('Failed to load owner billing state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
