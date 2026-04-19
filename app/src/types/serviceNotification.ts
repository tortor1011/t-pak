import type { ComplaintStatus } from '@/types/complaint';
import type { DeliveryTaskStatus } from '@/types/delivery';

export type ActiveComplaintStatus = Exclude<ComplaintStatus, 'resolved'>;
export type ActiveDeliveryStatus = Exclude<DeliveryTaskStatus, 'delivered'>;

interface ServiceNotificationBase {
  id: string;
  kind: 'slip' | 'complaint' | 'parcel';
  createdAt: string;
  href: string;
  roomNumber: string;
  tenantName: string;
}

export interface SlipServiceNotification extends ServiceNotificationBase {
  kind: 'slip';
  slipId: string;
  amount: number;
}

export interface ComplaintServiceNotification extends ServiceNotificationBase {
  kind: 'complaint';
  complaintId: string;
  complaintTitle: string;
  status: ActiveComplaintStatus;
}

export interface ParcelServiceNotification extends ServiceNotificationBase {
  kind: 'parcel';
  taskId: string;
  trackingNumber: string;
  status: ActiveDeliveryStatus;
}

export type ServiceNotification =
  | SlipServiceNotification
  | ComplaintServiceNotification
  | ParcelServiceNotification;
