export interface Tenant {
  id: string;
  fullName: string;
  phone: string;
  lineId: string;
  avatar: string | null;
  idCardUrl: string | null;
  roomId: string;
  roomNumber: string;
  contractDuration: '1-year' | '6-months' | 'monthly';
  moveInDate: string;
  moveOutDate: string | null;
  contractEnd: string;
  baseRent: number;
  securityDeposit: number;
  initialMeterElectricity: number;
  initialMeterWater: number;
  vehiclePlate: string | null;
}

export interface MoveOutData {
  tenantId: string;
  roomNumber: string;
  tenantName: string;
  finalElectricity: { previous: number; current: number; rate: number };
  finalWater: { previous: number; current: number; rate: number };
  damageDeductions: { description: string; amount: number }[];
  securityDeposit: number;
  netRefund: number;
}
