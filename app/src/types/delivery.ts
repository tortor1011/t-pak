import type {
  DeliveryTaskStatus as SharedDeliveryTaskStatus,
  TenantParcelRequestInput as SharedTenantParcelRequestInput,
  DeliveryProofInput as SharedDeliveryProofInput,
} from '@shared/types';

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
