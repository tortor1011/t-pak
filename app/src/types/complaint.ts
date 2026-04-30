export type MaintenanceStatus = 'new' | 'in-progress' | 'resolved';
export type MaintenanceCategory = 'plumbing' | 'electrical' | 'furniture' | 'cleaning' | 'noise' | 'appliance' | 'other';

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
