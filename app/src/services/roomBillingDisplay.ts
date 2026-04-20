import type { BillingStatus, Room, RoomOccupancy } from '@/types/room';

function isBillableOccupancy(occupancy: RoomOccupancy): boolean {
  return occupancy === 'occupied';
}

export function getRoomBillingStatusForDisplay(
  room: Pick<Room, 'occupancy' | 'billingStatus'>
): BillingStatus | null {
  if (!isBillableOccupancy(room.occupancy)) {
    return null;
  }

  return room.billingStatus;
}
