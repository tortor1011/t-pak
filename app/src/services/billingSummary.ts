import { Room } from '@/types/room';

export interface BillingSummary {
  totalRevenue: number;
  pendingPayments: number;
  collectedRevenue: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
}

function getRoomPayableAmount(room: Room): number {
  if (room.currentBill > 0) {
    return room.currentBill;
  }

  if (room.occupancy === 'occupied') {
    return room.baseRent;
  }

  return 0;
}

export function calculateBillingSummary(rooms: Room[]): BillingSummary {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((room) => room.occupancy === 'occupied').length;
  const vacantRooms = rooms.filter((room) => room.occupancy === 'vacant').length;

  const occupiedRoomList = rooms.filter((room) => room.occupancy === 'occupied');

  const totalRevenue = occupiedRoomList.reduce(
    (sum, room) => sum + getRoomPayableAmount(room),
    0
  );

  const pendingPayments = occupiedRoomList
    .filter((room) => room.billingStatus !== 'paid')
    .reduce((sum, room) => sum + getRoomPayableAmount(room), 0);

  return {
    totalRevenue,
    pendingPayments,
    collectedRevenue: Math.max(totalRevenue - pendingPayments, 0),
    totalRooms,
    occupiedRooms,
    vacantRooms,
  };
}