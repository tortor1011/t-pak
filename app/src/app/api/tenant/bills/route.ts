import { NextRequest, NextResponse } from 'next/server';
import { authenticateTenant } from '@/lib/tenant-auth';
import { prisma } from '@/lib/prisma';
import { mapBillingStatusToFrontend, dateToDateString, dateToISOString } from '@/lib/mappers';
import type { BillingStatus as PrismaBillingStatus } from '@/generated/prisma';

/**
 * Tenant Bill shape returned to the Tenant app.
 *
 * This combines the Owner's flat BillItem fields with the nested
 * UtilityUsage structure that the Tenant UI uses for transparency views.
 */
interface TenantBill {
  id: string;
  roomId: string;
  roomNumber: string;
  tenantName: string;
  month: string;
  year: number;
  dueDate: string;
  status: string;
  roomRent: number;
  water: { previous: number; current: number; unitPrice: number; total: number };
  electricity: { previous: number; current: number; unitPrice: number; total: number };
  otherFees: number;
  totalAmount: number;
  slipUrl: string | null;
  paidDate: string | null;
}

/**
 * Build the nested UtilityUsage structure from the flat bill fields + meter readings.
 */
async function buildTenantBill(
  bill: {
    id: string;
    roomId: string;
    month: string;
    year: number;
    baseRent: number;
    electricityUnits: number;
    electricityRate: number;
    electricityCost: number;
    waterUnits: number;
    waterRate: number;
    waterCost: number;
    additionalCharges: number;
    totalAmount: number;
    status: PrismaBillingStatus;
    dueDate: Date;
    paidDate: Date | null;
    slipUrl: string | null;
    meterReadDate: Date;
    room: { number: string };
  },
  tenantName: string
): Promise<TenantBill> {
  // Try to find matching meter readings for prev/current breakdown
  const meterReading = await prisma.meterReading.findFirst({
    where: {
      roomId: bill.roomId,
      readingDate: { lte: bill.meterReadDate },
    },
    orderBy: { readingDate: 'desc' },
  });

  const elecPrevious = meterReading?.electricityPrevious ?? 0;
  const elecCurrent = elecPrevious + bill.electricityUnits;
  const waterPrevious = meterReading?.waterPrevious ?? 0;
  const waterCurrent = waterPrevious + bill.waterUnits;

  return {
    id: bill.id,
    roomId: bill.roomId,
    roomNumber: bill.room.number,
    tenantName,
    month: bill.month,
    year: bill.year,
    dueDate: dateToDateString(bill.dueDate),
    status: mapBillingStatusToFrontend(bill.status),
    roomRent: bill.baseRent,
    water: {
      previous: waterPrevious,
      current: waterCurrent,
      unitPrice: bill.waterRate,
      total: bill.waterCost,
    },
    electricity: {
      previous: elecPrevious,
      current: elecCurrent,
      unitPrice: bill.electricityRate,
      total: bill.electricityCost,
    },
    otherFees: bill.additionalCharges,
    totalAmount: bill.totalAmount,
    slipUrl: bill.slipUrl,
    paidDate: dateToISOString(bill.paidDate),
  };
}

// ─── GET /api/tenant/bills ───

/**
 * Returns all bills for the authenticated tenant's room.
 * Requires Basic Auth: `Authorization: Basic base64(email:password)`
 */
export async function GET(request: NextRequest) {
  try {
    const tenant = await authenticateTenant(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bills = await prisma.bill.findMany({
      where: { roomId: tenant.roomId },
      include: {
        room: { select: { number: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const tenantBills: TenantBill[] = await Promise.all(
      bills.map((bill) => buildTenantBill(bill, tenant.fullName))
    );

    return NextResponse.json(tenantBills);
  } catch (error) {
    console.error('Error fetching tenant bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 },
    );
  }
}
