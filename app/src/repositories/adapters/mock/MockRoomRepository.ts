import { err, ok, type Result } from '@/repositories/common/Result';
import type { RoomRepository } from '@/repositories/rooms/RoomRepository';
import { MOCK_ROOMS } from '@/services/mockData';
import { buildOwnerRooms } from '@/services/ownerRooms';
import {
  applyBulkBaseRentOverrides as applyBulkBaseRentOverridesInStorage,
  type RoomPricingOverrides,
} from '@/services/roomPricingOverrides';
import {
  applyBulkRoomAdditionalChargeRuleIds as applyBulkRoomAdditionalChargeRuleIdsInStorage,
  resetBulkRoomAdditionalChargeOverrides as resetBulkRoomAdditionalChargeOverridesInStorage,
  type RoomAdditionalChargeOverrides,
} from '@/services/roomAdditionalChargeOverrides';
import type { Room } from '@/types/room';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function dispatchBillingStateUpdated(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event('estate_clarity.billing_state_updated'));
}

function normalizeRoomNumbers(roomNumbers: Array<string | number>): number[] {
  return roomNumbers
    .map((roomNumber) => Number.parseInt(String(roomNumber), 10))
    .filter((roomNumber) => Number.isFinite(roomNumber));
}

export class MockRoomRepository implements RoomRepository {
  listRooms(): Result<Room[]> {
    try {
      const rooms = buildOwnerRooms(MOCK_ROOMS);
      return ok(rooms);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load rooms from mock repository.',
        details: error,
      });
    }
  }

  applyBulkBaseRentOverrides(
    roomNumbers: Array<string | number>,
    baseRent: number
  ): Result<RoomPricingOverrides> {
    if (!Number.isFinite(baseRent) || baseRent <= 0) {
      return err({
        code: 'VALIDATION_ERROR',
        message: 'Base rent must be a number greater than 0.',
      });
    }

    try {
      const normalizedRoomNumbers = normalizeRoomNumbers(roomNumbers);
      const overrides = applyBulkBaseRentOverridesInStorage(
        normalizedRoomNumbers,
        baseRent
      );
      dispatchBillingStateUpdated();

      return ok(overrides);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to apply bulk base-rent overrides.',
        details: error,
      });
    }
  }

  applyBulkRoomAdditionalChargeRuleIds(
    roomNumbers: Array<string | number>,
    ruleIds: string[]
  ): Result<RoomAdditionalChargeOverrides> {
    try {
      const overrides = applyBulkRoomAdditionalChargeRuleIdsInStorage(
        roomNumbers,
        ruleIds
      );
      dispatchBillingStateUpdated();

      return ok(overrides);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to apply bulk additional-charge rules.',
        details: error,
      });
    }
  }

  resetBulkRoomAdditionalChargeOverrides(
    roomNumbers: Array<string | number>
  ): Result<RoomAdditionalChargeOverrides> {
    try {
      const overrides = resetBulkRoomAdditionalChargeOverridesInStorage(
        roomNumbers
      );
      dispatchBillingStateUpdated();

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
