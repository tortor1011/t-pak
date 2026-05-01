import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getBills } from '@/lib/api/bills';
import { mapBillingStatusToPrisma } from '@/lib/mappers';
import type { BillingStatus } from '@/types/room';

// ─── Validation Schema ───

const createBillSchema = z.object({
  roomId: z.string().min(1, 'roomId is required'),
  month: z.string().min(1, 'month is required'),
  year: z.number().int().min(2020).max(2100),
  baseRent: z.number().min(0),
  electricityUnits: z.number().min(0),
  electricityRate: z.number().min(0),
  electricityCost: z.number().min(0),
  waterUnits: z.number().min(0),
  waterRate: z.number().min(0),
  waterCost: z.number().min(0),
  additionalCharges: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  status: z.enum(['draft', 'pending', 'unpaid', 'pending-payment', 'paid', 'overdue', 'none']).default('unpaid'),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  meterReadDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

// ─── GET /api/bills ───

export async function GET(request: NextRequest) {
  try {
    // 1. Protect route
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse query params
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId') ?? undefined;

    // 3. Fetch from database via shared data access layer
    const bills = await getBills(roomId);

    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 },
    );
  }
}

// ─── POST /api/bills ───

export async function POST(request: NextRequest) {
  try {
    // 1. Protect route — only ADMIN can create bills
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can create bills' },
        { status: 403 },
      );
    }

    // 2. Parse and validate body
    const body = await request.json();
    const validation = createBillSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const data = validation.data;

    // 3. Verify room exists
    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: `Room not found: ${data.roomId}` },
        { status: 404 },
      );
    }

    // 4. Create bill in database
    const bill = await prisma.bill.create({
      data: {
        roomId: data.roomId,
        month: data.month,
        year: data.year,
        baseRent: data.baseRent,
        electricityUnits: data.electricityUnits,
        electricityRate: data.electricityRate,
        electricityCost: data.electricityCost,
        waterUnits: data.waterUnits,
        waterRate: data.waterRate,
        waterCost: data.waterCost,
        additionalCharges: data.additionalCharges,
        totalAmount: data.totalAmount,
        status: mapBillingStatusToPrisma(data.status as BillingStatus),
        dueDate: new Date(data.dueDate),
        meterReadDate: new Date(data.meterReadDate),
      },
      include: {
        room: {
          select: { number: true, floor: true, building: true },
        },
        slipVerification: true,
      },
    });

    // 5. Update room's currentBill
    await prisma.room.update({
      where: { id: data.roomId },
      data: {
        currentBill: data.totalAmount,
        billingStatus: mapBillingStatusToPrisma(data.status as BillingStatus),
      },
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 },
    );
  }
}
