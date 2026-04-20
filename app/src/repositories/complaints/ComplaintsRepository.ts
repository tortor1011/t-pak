import type { Result } from '@/repositories/common/Result';
import type { Complaint, ComplaintStatus } from '@/types/complaint';

export interface ComplaintsRepository {
  listComplaints(): Promise<Result<Complaint[]>>;
  updateComplaintStatus(
    complaintId: string,
    status: ComplaintStatus
  ): Promise<Result<Complaint[]>>;
}
