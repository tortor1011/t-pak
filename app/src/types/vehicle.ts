export type VehicleType = 'car' | 'motorcycle' | 'other';
export type VehicleStatus = 'verified' | 'unregistered' | 'inactive';

export interface VehicleRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  plate: string;
  vehicleType: VehicleType;
  status: VehicleStatus;
  registeredAt: string;
  updatedAt: string;
  deactivatedAt: string | null;
}

export interface VehicleRegistrationInput {
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  plate: string;
  vehicleType: VehicleType;
  status?: Exclude<VehicleStatus, 'inactive'>;
}

export interface VehicleUpdateInput {
  plate?: string;
  vehicleType?: VehicleType;
  status?: Exclude<VehicleStatus, 'inactive'>;
}

export interface VehicleSearchOptions {
  exactMatch?: boolean;
  activeTenantOnly?: boolean;
  roomNumber?: string;
}
