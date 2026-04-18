import { Room } from '@/types/room';
import { applyRoomPricingOverrides } from '@/services/roomPricingOverrides';
import { applyRoomBillingStatusOverrides } from '@/services/roomBillingStatusOverrides';

export function buildOwnerRooms(rooms: Room[]): Room[] {
  const roomsWithPricing = applyRoomPricingOverrides(rooms);
  return applyRoomBillingStatusOverrides(roomsWithPricing);
}
