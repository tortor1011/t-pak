import { ok, err, type Result } from '@/repositories/common/Result';
import type { ComplaintsRepository } from '@/repositories/complaints/ComplaintsRepository';
import type { Complaint, ComplaintStatus } from '@/types/complaint';
import { prisma } from '@/lib/prisma';
import { mapComplaintStatusToFrontend, mapComplaintStatusToPrisma, dateToISOString } from '@/lib/mappers';

export class PrismaComplaintsRepository implements ComplaintsRepository {
  async listComplaints(): Promise<Result<Complaint[]>> {
    try {
      const rows = await prisma.complaint.findMany({
        include: { room: { include: { tenant: { include: { user: { select: { fullName: true } } } } } } },
        orderBy: { createdAt: 'desc' },
      });
      const items: Complaint[] = rows.map((c) => ({
        id: c.id, roomNumber: c.room.number,
        tenantName: c.room.tenant?.user?.fullName ?? 'Unknown',
        category: c.category, title: c.title, description: c.description,
        status: mapComplaintStatusToFrontend(c.status),
        photoUrl: c.photoUrl, permissionToEnter: c.permissionToEnter,
        createdAt: c.createdAt.toISOString(), resolvedAt: dateToISOString(c.resolvedAt),
      }));
      return ok(items);
    } catch (error) {
      return err({ code: 'UNKNOWN_ERROR', message: 'Failed to load complaints.', details: error });
    }
  }

  async updateComplaintStatus(complaintId: string, status: ComplaintStatus): Promise<Result<Complaint[]>> {
    try {
      const existing = await prisma.complaint.findUnique({ where: { id: complaintId } });
      if (!existing) return err({ code: 'NOT_FOUND', message: `Complaint ${complaintId} not found.` });
      await prisma.complaint.update({
        where: { id: complaintId },
        data: { status: mapComplaintStatusToPrisma(status), resolvedAt: status === 'resolved' ? new Date() : existing.resolvedAt },
      });
      return this.listComplaints();
    } catch (error) {
      return err({ code: 'UNKNOWN_ERROR', message: 'Failed to update complaint status.', details: error });
    }
  }
}
