import { err, ok, type Result } from '@/repositories/common/Result';
import type { ComplaintsRepository } from '@/repositories/complaints/ComplaintsRepository';
import { MOCK_COMPLAINTS } from '@/services/mockData';
import type { Complaint } from '@/types/complaint';

export class MockComplaintsRepository implements ComplaintsRepository {
  listComplaints(): Result<Complaint[]> {
    try {
      return ok(MOCK_COMPLAINTS);
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load complaints.',
        details: error,
      });
    }
  }
}
