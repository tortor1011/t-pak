import { ok, err, type Result } from '@/repositories/common/Result';
import type { DeliveryRepository } from '@/repositories/deliveries/DeliveryRepository';
import type { DeliveryProofInput, DeliveryTask, TenantParcelRequestInput } from '@/types/delivery';
import { prisma } from '@/lib/prisma';
import { mapDeliveryStatusToFrontend } from '@/lib/mappers';

function mapTask(t: {
  id: string; tenantName: string; trackingNumber: string; phone: string;
  courierName: string | null; status: string; requestedAt: Date; startedAt: Date | null;
  deliveredAt: Date | null; proofPhotoUrl: string | null; deliveryNote: string | null;
  confirmationChecked: boolean; room: { number: string };
}): DeliveryTask {
  return {
    id: t.id, roomNumber: t.room.number, tenantName: t.tenantName,
    trackingNumber: t.trackingNumber, phone: t.phone, courierName: t.courierName,
    status: mapDeliveryStatusToFrontend(t.status as 'pending' | 'in_progress' | 'delivered' | 'returned'),
    requestedAt: t.requestedAt.toISOString(), startedAt: t.startedAt?.toISOString() ?? null,
    deliveredAt: t.deliveredAt?.toISOString() ?? null, proofPhotoUrl: t.proofPhotoUrl,
    deliveryNote: t.deliveryNote, confirmationChecked: t.confirmationChecked,
  };
}

export class PrismaDeliveryRepository implements DeliveryRepository {
  private async loadAll(): Promise<DeliveryTask[]> {
    const rows = await prisma.deliveryTask.findMany({
      include: { room: { select: { number: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapTask);
  }

  async listDeliveryTasks(): Promise<Result<DeliveryTask[]>> {
    try { return ok(await this.loadAll()); }
    catch (error) { return err({ code: 'UNKNOWN_ERROR', message: 'Failed to load delivery tasks.', details: error }); }
  }

  async findDeliveryTaskById(taskId: string): Promise<Result<DeliveryTask | null>> {
    try {
      const row = await prisma.deliveryTask.findUnique({ where: { id: taskId }, include: { room: { select: { number: true } } } });
      return ok(row ? mapTask(row) : null);
    } catch (error) { return err({ code: 'UNKNOWN_ERROR', message: 'Failed to find delivery task.', details: error }); }
  }

  async createTaskFromTenantRequest(payload: TenantParcelRequestInput): Promise<Result<DeliveryTask[]>> {
    try {
      const room = await prisma.room.findUnique({ where: { number: payload.roomNumber }, include: { tenant: { include: { user: true } } } });
      if (!room) return err({ code: 'NOT_FOUND', message: `Room ${payload.roomNumber} not found.` });
      await prisma.deliveryTask.create({
        data: {
          roomId: room.id, tenantName: room.tenant?.user?.fullName ?? 'Unknown',
          trackingNumber: payload.trackingNumber, phone: payload.phone ?? room.tenant?.user?.phone ?? '',
          courierName: null, status: 'pending', requestedAt: new Date(),
          deliveryNote: payload.notes ?? null,
        },
      });
      return ok(await this.loadAll());
    } catch (error) { return err({ code: 'UNKNOWN_ERROR', message: 'Failed to create delivery task.', details: error }); }
  }

  async startDeliveryTask(taskId: string): Promise<Result<DeliveryTask[]>> {
    try {
      await prisma.deliveryTask.update({ where: { id: taskId }, data: { status: 'in_progress', startedAt: new Date() } });
      return ok(await this.loadAll());
    } catch (error) { return err({ code: 'UNKNOWN_ERROR', message: 'Failed to start delivery task.', details: error }); }
  }

  async completeDeliveryTask(taskId: string, payload: DeliveryProofInput): Promise<Result<DeliveryTask[]>> {
    try {
      await prisma.deliveryTask.update({
        where: { id: taskId },
        data: { status: 'delivered', deliveredAt: new Date(), proofPhotoUrl: payload.proofPhotoUrl ?? null, deliveryNote: payload.deliveryNote ?? null, confirmationChecked: payload.confirmationChecked ?? false },
      });
      return ok(await this.loadAll());
    } catch (error) { return err({ code: 'UNKNOWN_ERROR', message: 'Failed to complete delivery task.', details: error }); }
  }
}
