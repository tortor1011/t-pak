export type SharedDeliveryTaskStatus = 'pending' | 'in-progress' | 'delivered' | 'returned';
export interface SharedTenantParcelRequestInput {
  tenantName: string;
  roomNumber: string;
  trackingNumber: string;
  phone: string;
  notes?: string;
}
export interface SharedDeliveryProofInput {
  proofPhotoUrl: string;
  deliveryNote?: string;
  confirmationChecked: boolean;
}

export type DeliveryTaskStatus = SharedDeliveryTaskStatus;

export type { SharedTenantParcelRequestInput as TenantParcelRequestInput };

export type { SharedDeliveryProofInput as DeliveryProofInput };

export interface DeliveryTask {
  id: string;
  tenantName: string;
  roomNumber: string;
  trackingNumber: string;
  phone: string;
  courierName: string | null;
  status: DeliveryTaskStatus;
  requestedAt: string;
  startedAt: string | null;
  deliveredAt: string | null;
  proofPhotoUrl: string | null;
  deliveryNote: string | null;
  confirmationChecked: boolean;
}
