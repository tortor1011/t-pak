import { err, ok, type Result } from '@/repositories/common/Result';
import type { ComplaintsRepository } from '@/repositories/complaints/ComplaintsRepository';
import { loadComplaintQueue, updateComplaintStatus } from '@/services/complaintQueue';
import type { Complaint, ComplaintStatus } from '@/types/complaint';

export class MockComplaintsRepository implements ComplaintsRepository {
  listComplaints(): Result<Complaint[]> {
    try {
      return ok(loadComplaintQueue());
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load complaints.',
        details: error,
      });
    }
  }

  updateComplaintStatus(
    complaintId: string,
    status: ComplaintStatus
  ): Result<Complaint[]> {
    try {
      return ok(updateComplaintStatus(complaintId, status));
    } catch (error) {
      if (error instanceof Error) {
        const normalizedMessage = error.message.toLowerCase();

        if (normalizedMessage.includes('not found')) {
          return err({
            code: 'NOT_FOUND',
            message: error.message,
            details: error,
          });
        }

        if (normalizedMessage.includes('cannot')) {
          return err({
            code: 'CONFLICT',
            message: error.message,
            details: error,
          });
        }
      }

      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to update complaint status.',
        details: error,
      });
    }
  }
}
