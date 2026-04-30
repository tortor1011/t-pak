export type SharedBillingStatus = 'draft' | 'pending' | 'unpaid' | 'pending-payment' | 'paid' | 'overdue' | 'none';

/** Billing status drives the entire UI */
export type BillingStatus = SharedBillingStatus;

/** Room occupancy status */
export type RoomOccupancy = 'occupied' | 'vacant' | 'reserved';

export interface Room {
  id: string;
  number: string;
  floor: number;
  building: string;
  occupancy: RoomOccupancy;
  isConnectedWithDorm?: boolean;
  billingStatus: BillingStatus;
  baseRent: number;
  currentBill: number;
  tenantId: string | null;
  tenantName: string | null;
  tenantAvatar: string | null;
  amenities: string[];
}

export interface RoomFilter {
  tab: 'all' | 'pending';
  search: string;
}
