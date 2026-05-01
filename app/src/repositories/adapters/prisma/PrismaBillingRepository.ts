import { ok, err, type Result } from '@/repositories/common/Result';
import type { BillingRepository } from '@/repositories/billing/BillingRepository';
import type {
  BillingAggregationRoom,
  DebtCollectionQueueItem,
  MeterReadingSubmission,
  OwnerBillingAggregation,
  SlipReviewDecision,
  SlipVerificationQueueItem,
} from '@/repositories/billing/types';
import type { BillItem, MeterReading } from '@/types/billing';
import { prisma } from '@/lib/prisma';
import {
  mapBillingStatusToFrontend,
  mapBillingStatusToPrisma,
  mapSlipDecisionToFrontend,
  dateToDateString,
  dateToISOString,
} from '@/lib/mappers';

export class PrismaBillingRepository implements BillingRepository {
  async loadRoomBills(roomId: string): Promise<Result<BillItem[]>> {
    try {
      const bills = await prisma.bill.findMany({
        where: { roomId },
        include: {
          room: { include: { tenant: { include: { user: { select: { fullName: true } } } } } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const items: BillItem[] = bills.map((b) => ({
        id: b.id,
        roomId: b.roomId,
        roomNumber: b.room.number,
        tenantName: b.room.tenant?.user?.fullName ?? 'Unknown',
        month: b.month,
        year: b.year,
        baseRent: b.baseRent,
        electricityUnits: b.electricityUnits,
        electricityRate: b.electricityRate,
        electricityCost: b.electricityCost,
        waterUnits: b.waterUnits,
        waterRate: b.waterRate,
        waterCost: b.waterCost,
        additionalCharges: b.additionalCharges,
        totalAmount: b.totalAmount,
        status: mapBillingStatusToFrontend(b.status),
        dueDate: dateToDateString(b.dueDate),
        paidDate: dateToISOString(b.paidDate),
        slipUrl: b.slipUrl,
        meterReadDate: dateToDateString(b.meterReadDate),
      }));

      return ok(items);
    } catch (error) {
      return err({ code: 'UNKNOWN_ERROR', message: 'Failed to load room bills.', details: error });
    }
  }

  async loadMeterReadings(): Promise<Result<MeterReading[]>> {
    try {
      const readings = await prisma.meterReading.findMany({
        include: { room: { select: { number: true, building: true, floor: true } } },
        orderBy: { createdAt: 'desc' },
      });

      // Group by roomId — take latest per room
      const latestByRoom = new Map<string, typeof readings[0]>();
      for (const r of readings) {
        if (!latestByRoom.has(r.roomId)) {
          latestByRoom.set(r.roomId, r);
        }
      }

      const items: MeterReading[] = Array.from(latestByRoom.values()).map((r) => ({
        roomId: r.roomId,
        roomNumber: r.room.number,
        building: r.room.building,
        floor: r.room.floor,
        electricity: { previous: r.electricityPrevious, current: r.electricityCurrent },
        water: { previous: r.waterPrevious, current: r.waterCurrent },
      }));

      return ok(items);
    } catch (error) {
      return err({ code: 'UNKNOWN_ERROR', message: 'Failed to load meter readings.', details: error });
    }
  }

  async submitMeterReadings(
    readings: MeterReadingSubmission[]
  ): Promise<Result<MeterReading[]>> {
    if (readings.length === 0) {
      return err({ code: 'VALIDATION_ERROR', message: 'At least one meter reading is required.' });
    }

    try {
      // Get current readings for validation
      const currentResult = await this.loadMeterReadings();
      if (!currentResult.ok) return currentResult;

      const existingByRoomId = new Map(currentResult.value.map((r) => [r.roomId, r]));

      for (const reading of readings) {
        const existing = existingByRoomId.get(reading.roomId);
        if (!existing) {
          return err({ code: 'NOT_FOUND', message: `Room ${reading.roomId} not found.` });
        }
        if (reading.electricityCurrent < existing.electricity.previous) {
          return err({ code: 'VALIDATION_ERROR', message: `Room ${existing.roomNumber} electricity reading must be >= previous.` });
        }
        if (reading.waterCurrent < existing.water.previous) {
          return err({ code: 'VALIDATION_ERROR', message: `Room ${existing.roomNumber} water reading must be >= previous.` });
        }
      }

      // Update existing meter readings
      for (const reading of readings) {
        const existing = existingByRoomId.get(reading.roomId);
        if (!existing) continue;

        // Find the latest meter reading for this room and update it
        const latestReading = await prisma.meterReading.findFirst({
          where: { roomId: reading.roomId },
          orderBy: { createdAt: 'desc' },
        });

        if (latestReading) {
          await prisma.meterReading.update({
            where: { id: latestReading.id },
            data: {
              electricityCurrent: reading.electricityCurrent,
              waterCurrent: reading.waterCurrent,
            },
          });
        }
      }

      // Return updated readings
      return this.loadMeterReadings();
    } catch (error) {
      return err({ code: 'UNKNOWN_ERROR', message: 'Failed to submit meter readings.', details: error });
    }
  }

  async loadOwnerBillingAggregation(
    rooms: BillingAggregationRoom[]
  ): Promise<Result<OwnerBillingAggregation>> {
    try {
      // Count pending slips
      const pendingSlipCount = await prisma.slipVerification.count({
        where: { decision: 'pending' },
      });

      // Load overdue bills as debt queue
      const overdueBills = await prisma.bill.findMany({
        where: { status: { in: ['unpaid', 'overdue'] } },
        include: {
          room: { include: { tenant: { include: { user: true } } } },
        },
      });

      // Group by room for debt items
      const debtByRoom = new Map<string, { total: number; months: number; bill: typeof overdueBills[0] }>();
      for (const bill of overdueBills) {
        const existing = debtByRoom.get(bill.room.number);
        if (existing) {
          existing.total += bill.totalAmount;
          existing.months += 1;
        } else {
          debtByRoom.set(bill.room.number, { total: bill.totalAmount, months: 1, bill });
        }
      }

      const paidRoomNumbers = new Set(
        rooms.filter((r) => r.billingStatus === 'paid').map((r) => r.number)
      );

      const debtQueue: DebtCollectionQueueItem[] = Array.from(debtByRoom.entries()).map(
        ([roomNumber, data]) => ({
          id: `debt-${roomNumber}`,
          roomNumber,
          tenantName: data.bill.room.tenant?.user?.fullName ?? 'Unknown',
          totalOutstanding: data.total,
          monthsOverdue: data.months,
          lastReminder: null,
          phone: data.bill.room.tenant?.user?.phone ?? '',
          reminderCount: 0,
        })
      );

      const activeDebtQueue = debtQueue.filter((d) => !paidRoomNumbers.has(d.roomNumber));
      const totalOutstanding = activeDebtQueue.reduce((sum, d) => sum + d.totalOutstanding, 0);

      return ok({ pendingSlipCount, debtQueue, activeDebtQueue, totalOutstanding });
    } catch (error) {
      return err({ code: 'UNKNOWN_ERROR', message: 'Failed to load billing aggregation.', details: error });
    }
  }

  async loadSlipVerificationQueue(): Promise<Result<SlipVerificationQueueItem[]>> {
    try {
      const slips = await prisma.slipVerification.findMany({
        include: {
          bill: { include: { room: { include: { tenant: { include: { user: true } } } } } },
        },
        orderBy: { uploadedAt: 'desc' },
      });

      const items: SlipVerificationQueueItem[] = slips.map((s) => ({
        id: s.id,
        roomNumber: s.bill.room.number,
        tenantName: s.bill.room.tenant?.user?.fullName ?? 'Unknown',
        amount: s.bill.totalAmount,
        slipUrl: s.slipUrl,
        uploadedAt: s.uploadedAt.toISOString(),
        detectedAmount: s.detectedAmount,
        detectedDate: dateToISOString(s.detectedDate),
        isAmountMatch: s.isAmountMatch,
        decision: mapSlipDecisionToFrontend(s.decision),
        reviewedAt: dateToISOString(s.reviewedAt),
      }));

      return ok(items);
    } catch (error) {
      return err({ code: 'UNKNOWN_ERROR', message: 'Failed to load slip verification queue.', details: error });
    }
  }

  async reviewSlipVerification(
    slipId: string,
    decision: SlipReviewDecision
  ): Promise<Result<SlipVerificationQueueItem[]>> {
    try {
      const slip = await prisma.slipVerification.findUnique({
        where: { id: slipId },
        include: { bill: true },
      });

      if (!slip) {
        return err({ code: 'NOT_FOUND', message: `Slip ${slipId} not found.` });
      }

      const prismaDecision = decision === 'approved' ? 'approved' as const : 'rejected' as const;

      await prisma.slipVerification.update({
        where: { id: slipId },
        data: { decision: prismaDecision, reviewedAt: new Date() },
      });

      // If approved, mark bill as paid
      if (decision === 'approved') {
        await prisma.bill.update({
          where: { id: slip.billId },
          data: { status: 'paid', paidDate: new Date() },
        });
        await prisma.room.update({
          where: { id: slip.bill.roomId },
          data: { billingStatus: 'paid' },
        });
      }

      return this.loadSlipVerificationQueue();
    } catch (error) {
      return err({ code: 'UNKNOWN_ERROR', message: 'Failed to review slip.', details: error });
    }
  }

  async loadDebtCollectionQueue(): Promise<Result<DebtCollectionQueueItem[]>> {
    try {
      const overdueBills = await prisma.bill.findMany({
        where: { status: { in: ['unpaid', 'overdue'] } },
        include: {
          room: { include: { tenant: { include: { user: true } } } },
        },
      });

      const debtByRoom = new Map<string, { total: number; months: number; bill: typeof overdueBills[0] }>();
      for (const bill of overdueBills) {
        const existing = debtByRoom.get(bill.room.number);
        if (existing) {
          existing.total += bill.totalAmount;
          existing.months += 1;
        } else {
          debtByRoom.set(bill.room.number, { total: bill.totalAmount, months: 1, bill });
        }
      }

      const queue: DebtCollectionQueueItem[] = Array.from(debtByRoom.entries()).map(
        ([roomNumber, data]) => ({
          id: `debt-${roomNumber}`,
          roomNumber,
          tenantName: data.bill.room.tenant?.user?.fullName ?? 'Unknown',
          totalOutstanding: data.total,
          monthsOverdue: data.months,
          lastReminder: null,
          phone: data.bill.room.tenant?.user?.phone ?? '',
          reminderCount: 0,
        })
      );

      return ok(queue);
    } catch (error) {
      return err({ code: 'UNKNOWN_ERROR', message: 'Failed to load debt queue.', details: error });
    }
  }

  async sendDebtReminder(debtId: string): Promise<Result<DebtCollectionQueueItem[]>> {
    // For now, just reload — real implementation would send LINE/push notification
    return this.loadDebtCollectionQueue();
  }

  async sendBulkDebtRemindersByIds(
    debtIds: string[]
  ): Promise<Result<DebtCollectionQueueItem[]>> {
    return this.loadDebtCollectionQueue();
  }

  async settleDebtAndMarkRoomPaid(
    roomNumber: string
  ): Promise<Result<DebtCollectionQueueItem[]>> {
    try {
      const room = await prisma.room.findUnique({ where: { number: roomNumber } });
      if (!room) {
        return err({ code: 'NOT_FOUND', message: `Room ${roomNumber} not found.` });
      }

      // Mark all unpaid/overdue bills for this room as paid
      await prisma.bill.updateMany({
        where: { roomId: room.id, status: { in: ['unpaid', 'overdue'] } },
        data: { status: 'paid', paidDate: new Date() },
      });

      await prisma.room.update({
        where: { id: room.id },
        data: { billingStatus: 'paid' },
      });

      return this.loadDebtCollectionQueue();
    } catch (error) {
      return err({ code: 'UNKNOWN_ERROR', message: 'Failed to settle debt.', details: error });
    }
  }
}
