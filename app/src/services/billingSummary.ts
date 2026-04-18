import { Room } from '@/types/room';
import {
  calculateRoomAdditionalCharge,
  loadAdditionalChargePerRoom,
} from '@/services/additionalChargeRules';

export interface BillingSummary {
  totalRevenue: number;
  pendingPayments: number;
  collectedRevenue: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
}

function getRoomPayableAmount(
  room: Room,
  additionalChargePerRoom: number
): number {
  let basePayableAmount = 0;

  if (room.currentBill > 0) {
    basePayableAmount = room.currentBill;
  } else if (room.occupancy === 'occupied') {
    basePayableAmount = room.baseRent;
  }

  return basePayableAmount + calculateRoomAdditionalCharge(room, additionalChargePerRoom);
}

export function calculateBillingSummary(rooms: Room[]): BillingSummary {
  const additionalChargePerRoom = loadAdditionalChargePerRoom();
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((room) => room.occupancy === 'occupied').length;
  const vacantRooms = rooms.filter((room) => room.occupancy === 'vacant').length;

  const occupiedRoomList = rooms.filter((room) => room.occupancy === 'occupied');

  const totalRevenue = occupiedRoomList.reduce(
    (sum, room) => sum + getRoomPayableAmount(room, additionalChargePerRoom),
    0
  );

  const pendingPayments = occupiedRoomList
    .filter((room) => room.billingStatus !== 'paid')
    .reduce(
      (sum, room) => sum + getRoomPayableAmount(room, additionalChargePerRoom),
      0
    );

  return {
    totalRevenue,
    pendingPayments,
    collectedRevenue: Math.max(totalRevenue - pendingPayments, 0),
    totalRooms,
    occupiedRooms,
    vacantRooms,
  };
}