import type { MaintenanceStatus, MaintenanceCategory } from '@shared/types';

export type ComplaintStatus = MaintenanceStatus;
export type ComplaintCategory = MaintenanceCategory;

export interface Complaint {
  id: string;
  roomNumber: string;
  tenantName: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  status: ComplaintStatus;
  photoUrl: string | null;
  permissionToEnter: boolean;
  createdAt: string;
  resolvedAt: string | null;
}
