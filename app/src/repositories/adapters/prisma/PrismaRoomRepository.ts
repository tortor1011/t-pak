import { ok, err, type Result } from '@/repositories/common/Result';
import type { RoomRepository } from '@/repositories/rooms/RoomRepository';
import type { RoomPricingOverrides } from '@/services/roomPricingOverrides';
import type { RoomAdditionalChargeOverrides } from '@/services/roomAdditionalChargeOverrides';
import type { Room } from '@/types/room';
import { prisma } from '@/lib/prisma';
import { mapBillingStatusToFrontend } from '@/lib/mappers';

export class PrismaRoomRepository implements RoomRepository {
  async listRooms(): Promise<Result<Room[]>> {
    try {
      const dbRooms = await prisma.room.findMany({
        include: {
          tenant: {
            include: { user: { select: { fullName: true, avatar: true } } },
          },
        },
        orderBy: [{ building: 'asc' }, { floor: 'asc' }, { number: 'asc' }],
      });

      const rooms: Room[] = dbRooms.map((r) => ({
        id: r.id,
        number: r.number,
        floor: r.floor,
        building: r.building,
        occupancy: r.occupancy,
        billingStatus: mapBillingStatusToFrontend(r.billingStatus),
        baseRent: r.baseRent,
        currentBill: r.currentBill,
        tenantId: r.tenant?.id ?? null,
        tenantName: r.tenant?.user.fullName ?? null,
        tenantAvatar: r.tenant?.user.avatar ?? null,
        amenities: r.amenities,
      }));

      return ok(rooms);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load rooms.',
        details: error,
      });
    }
  }

  async applyBulkBaseRentOverrides(
    roomNumbers: Array<string | number>,
    baseRent: number
  ): Promise<Result<RoomPricingOverrides>> {
    if (!Number.isFinite(baseRent) || baseRent <= 0) {
      return err({
        code: 'VALIDATION_ERROR',
        message: 'Base rent must be a number greater than 0.',
      });
    }

    try {
      const normalized = roomNumbers.map((n) => String(n));

      await prisma.room.updateMany({
        where: { number: { in: normalized } },
        data: { baseRent },
      });

      const overrides: RoomPricingOverrides = {};
      for (const num of normalized) {
        overrides[num] = baseRent;
      }

      return ok(overrides);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to apply bulk base-rent overrides.',
        details: error,
      });
    }
  }

  async applyBulkRoomAdditionalChargeRuleIds(
    roomNumbers: Array<string | number>,
    ruleIds: string[]
  ): Promise<Result<RoomAdditionalChargeOverrides>> {
    try {
      // For now, store as a JSON field approach or room-level metadata.
      // Since the current frontend uses localStorage, we mirror the behavior
      // by returning the expected shape without a dedicated DB table.
      const overrides: RoomAdditionalChargeOverrides = {};
      const normalized = roomNumbers.map((n) => String(n));
      for (const num of normalized) {
        overrides[num] = ruleIds;
      }
      return ok(overrides);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to apply bulk additional-charge rules.',
        details: error,
      });
    }
  }

  async resetBulkRoomAdditionalChargeOverrides(
    roomNumbers: Array<string | number>
  ): Promise<Result<RoomAdditionalChargeOverrides>> {
    try {
      const overrides: RoomAdditionalChargeOverrides = {};
      const normalized = roomNumbers.map((n) => String(n));
      for (const num of normalized) {
        overrides[num] = undefined as unknown as string[];
      }
      return ok(overrides);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to reset room additional-charge overrides.',
        details: error,
      });
    }
  }
}
