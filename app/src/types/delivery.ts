export type DeliveryTaskStatus = 'pending' | 'in-progress' | 'delivered';

export interface TenantParcelRequestInput {
  tenantName: string;
  roomNumber: string;
  trackingNumber: string;
  phone: string;
}

export interface DeliveryProofInput {
  proofPhotoUrl: string;
  confirmationChecked: boolean;
  deliveryNote?: string;
}

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
