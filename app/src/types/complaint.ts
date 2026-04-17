export type ComplaintStatus = 'new' | 'in-progress' | 'resolved';
export type ComplaintCategory = 'plumbing' | 'electrical' | 'appliance' | 'pest' | 'noise' | 'other';

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
