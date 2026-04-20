import type { Result } from '@/repositories/common/Result';
import type { RoomAdditionalChargeOverrides } from '@/services/roomAdditionalChargeOverrides';
import type { RoomPricingOverrides } from '@/services/roomPricingOverrides';
import type { Room } from '@/types/room';

export interface RoomRepository {
  listRooms(): Promise<Result<Room[]>>;
  applyBulkBaseRentOverrides(
    roomNumbers: Array<string | number>,
    baseRent: number
  ): Promise<Result<RoomPricingOverrides>>;
  applyBulkRoomAdditionalChargeRuleIds(
    roomNumbers: Array<string | number>,
    ruleIds: string[]
  ): Promise<Result<RoomAdditionalChargeOverrides>>;
  resetBulkRoomAdditionalChargeOverrides(
    roomNumbers: Array<string | number>
  ): Promise<Result<RoomAdditionalChargeOverrides>>;
}
