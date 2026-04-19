import type { Result } from '@/repositories/common/Result';
import type { Complaint } from '@/types/complaint';

export interface ComplaintsRepository {
  listComplaints(): Result<Complaint[]>;
}
