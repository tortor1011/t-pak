import type { SlipVerificationQueueItem } from '@/repositories/billing/types';
import type { Complaint } from '@/types/complaint';
import type { DeliveryTask } from '@/types/delivery';
import type {
  ActiveComplaintStatus,
  ActiveDeliveryStatus,
  ServiceNotification,
} from '@/types/serviceNotification';

interface ServiceNotificationStreamInput {
  slipQueue: SlipVerificationQueueItem[];
  complaints: Complaint[];
  deliveryTasks: DeliveryTask[];
}

function isActiveComplaintStatus(
  status: Complaint['status']
): status is ActiveComplaintStatus {
  return status !== 'resolved';
}

function isActiveDeliveryStatus(
  status: DeliveryTask['status']
): status is ActiveDeliveryStatus {
  return status !== 'delivered';
}

function mapSlipNotifications(
  slipQueue: SlipVerificationQueueItem[]
): ServiceNotification[] {
  return slipQueue
    .filter((item) => item.decision === 'pending')
    .map((item) => ({
      id: `slip-${item.id}`,
      kind: 'slip' as const,
      slipId: item.id,
      roomNumber: item.roomNumber,
      tenantName: item.tenantName,
      amount: item.amount,
      createdAt: item.uploadedAt,
      href: '/billing/verify',
    }));
}

function mapComplaintNotifications(complaints: Complaint[]): ServiceNotification[] {
  return complaints
    .filter((item) => isActiveComplaintStatus(item.status))
    .map((item) => ({
      id: `complaint-${item.id}`,
      kind: 'complaint' as const,
      complaintId: item.id,
      complaintTitle: item.title,
      status: item.status,
      roomNumber: item.roomNumber,
      tenantName: item.tenantName,
      createdAt: item.createdAt,
      href: '/services/complaints',
    }));
}

function mapParcelNotifications(deliveryTasks: DeliveryTask[]): ServiceNotification[] {
  return deliveryTasks
    .filter((item) => isActiveDeliveryStatus(item.status))
    .map((item) => ({
      id: `parcel-${item.id}`,
      kind: 'parcel' as const,
      taskId: item.id,
      trackingNumber: item.trackingNumber,
      status: item.status,
      roomNumber: item.roomNumber,
      tenantName: item.tenantName,
      createdAt: item.startedAt ?? item.requestedAt,
      href: '/services/parcel-delivery',
    }));
}

export function buildServiceNotifications(
  input: ServiceNotificationStreamInput
): ServiceNotification[] {
  const notifications = [
    ...mapSlipNotifications(input.slipQueue),
    ...mapComplaintNotifications(input.complaints),
    ...mapParcelNotifications(input.deliveryTasks),
  ];

  return notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
