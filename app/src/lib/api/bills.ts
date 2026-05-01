import { prisma } from '@/lib/prisma';
import { mapBillingStatusToFrontend, dateToDateString, dateToISOString } from '@/lib/mappers';
import type { BillItem } from '@/types/billing';
import type { Bill, Room, SlipVerification } from '@/generated/prisma';

/** Prisma Bill with included relations */
type BillWithRelations = Bill & {
  room: Pick<Room, 'number' | 'floor' | 'building'>;
  slipVerification: SlipVerification | null;
};

/**
 * Map a Prisma Bill (with relations) to the frontend BillItem interface.
 */
function mapBillToFrontend(bill: BillWithRelations, tenantName: string): BillItem {
  return {
    id: bill.id,
    roomId: bill.roomId,
    roomNumber: bill.room.number,
    tenantName,
    month: bill.month,
    year: bill.year,
    baseRent: bill.baseRent,
    electricityUnits: bill.electricityUnits,
    electricityRate: bill.electricityRate,
    electricityCost: bill.electricityCost,
    waterUnits: bill.waterUnits,
    waterRate: bill.waterRate,
    waterCost: bill.waterCost,
    additionalCharges: bill.additionalCharges,
    totalAmount: bill.totalAmount,
    status: mapBillingStatusToFrontend(bill.status),
    dueDate: dateToDateString(bill.dueDate),
    paidDate: dateToISOString(bill.paidDate),
    slipUrl: bill.slipUrl,
    meterReadDate: dateToDateString(bill.meterReadDate),
  };
}

/**
 * Fetch bills from the database, optionally filtered by roomId.
 * Used by both Server Components (SSR) and API routes.
 */
export async function getBills(roomId?: string): Promise<BillItem[]> {
  const bills = await prisma.bill.findMany({
    where: roomId ? { roomId } : undefined,
    include: {
      room: {
        select: { number: true, floor: true, building: true },
      },
      slipVerification: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch tenant names for each unique room
  const roomIds = [...new Set(bills.map((b) => b.roomId))];
  const tenants = await prisma.tenant.findMany({
    where: { roomId: { in: roomIds } },
    include: { user: { select: { fullName: true } } },
  });

  const tenantNameByRoomId = new Map(
    tenants.map((t) => [t.roomId, t.user?.fullName ?? 'Unknown']),
  );

  return bills.map((bill) =>
    mapBillToFrontend(
      bill as BillWithRelations,
      tenantNameByRoomId.get(bill.roomId) ?? 'Unknown',
    ),
  );
}

/**
 * Fetch a single bill by ID.
 */
export async function getBillById(id: string): Promise<BillItem | null> {
  const bill = await prisma.bill.findUnique({
    where: { id },
    include: {
      room: {
        select: { number: true, floor: true, building: true },
      },
      slipVerification: true,
    },
  });

  if (!bill) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { roomId: bill.roomId },
    include: { user: { select: { fullName: true } } },
  });

  return mapBillToFrontend(
    bill as BillWithRelations,
    tenant?.user?.fullName ?? 'Unknown',
  );
}
