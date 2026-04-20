import type { Result } from '@/repositories/common/Result';
import type { RoomAdditionalChargeOverrides } from '@/services/roomAdditionalChargeOverrides';
import type { RoomPricingOverrides } from '@/services/roomPricingOverrides';
import type { Room } from '@/types/room';

export interface RoomRepository {
  listRooms(): Result<Room[]>;
  applyBulkBaseRentOverrides(
    roomNumbers: Array<string | number>,
    baseRent: number
  ): Result<RoomPricingOverrides>;
  applyBulkRoomAdditionalChargeRuleIds(
    roomNumbers: Array<string | number>,
    ruleIds: string[]
  ): Result<RoomAdditionalChargeOverrides>;
  resetBulkRoomAdditionalChargeOverrides(
    roomNumbers: Array<string | number>
  ): Result<RoomAdditionalChargeOverrides>;
}
