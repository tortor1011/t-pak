import { err, ok, type Result } from '@/repositories/common/Result';
import type { DeliveryRepository } from '@/repositories/deliveries/DeliveryRepository';
import type { NotificationRepository } from '@/repositories/notifications/NotificationRepository';
import {
  completeDeliveryTask,
  createDeliveryTaskFromTenantRequest,
  findDeliveryTaskById,
  loadDeliveryTasks,
  markDeliveryTaskInProgress,
} from '@/services/deliveryTaskQueue';
import type {
  DeliveryProofInput,
  DeliveryTask,
  TenantParcelRequestInput,
} from '@/types/delivery';

function mapDeliveryError(error: unknown): {
  code: 'NOT_FOUND' | 'VALIDATION_ERROR' | 'CONFLICT' | 'UNKNOWN_ERROR';
  message: string;
  details?: unknown;
} {
  if (error instanceof Error) {
    const message = error.message;
    const normalized = message.toLowerCase();

    if (normalized.includes('not found')) {
      return { code: 'NOT_FOUND', message, details: error };
    }

    if (normalized.includes('required') || normalized.includes('confirmation')) {
      return { code: 'VALIDATION_ERROR', message, details: error };
    }

    if (normalized.includes('already') || normalized.includes('cannot')) {
      return { code: 'CONFLICT', message, details: error };
    }

    return { code: 'UNKNOWN_ERROR', message, details: error };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Unexpected delivery repository error.',
    details: error,
  };
}

export class MockDeliveryRepository implements DeliveryRepository {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  listDeliveryTasks(): Result<DeliveryTask[]> {
    try {
      return ok(loadDeliveryTasks());
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load delivery tasks.',
        details: error,
      });
    }
  }

  findDeliveryTaskById(taskId: string): Result<DeliveryTask | null> {
    try {
      return ok(findDeliveryTaskById(taskId));
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load delivery task.',
        details: error,
      });
    }
  }

  createTaskFromTenantRequest(
    payload: TenantParcelRequestInput
  ): Result<DeliveryTask[]> {
    try {
      const queue = createDeliveryTaskFromTenantRequest(payload);
      return ok(queue);
    } catch (error) {
      const mapped = mapDeliveryError(error);
      return err(mapped);
    }
  }

  startDeliveryTask(taskId: string): Result<DeliveryTask[]> {
    try {
      const queue = markDeliveryTaskInProgress(taskId);
      return ok(queue);
    } catch (error) {
      const mapped = mapDeliveryError(error);
      return err(mapped);
    }
  }

  completeDeliveryTask(
    taskId: string,
    payload: DeliveryProofInput
  ): Result<DeliveryTask[]> {
    try {
      const queue = completeDeliveryTask(taskId, payload);
      const completedTask = queue.find((task) => task.id === taskId);

      if (completedTask && completedTask.status === 'delivered') {
        this.notificationRepository.sendNotification(['line', 'app'], {
          recipient: completedTask.phone,
          title: `Parcel delivered to room ${completedTask.roomNumber}`,
          body: `Tracking ${completedTask.trackingNumber} has been delivered with photo proof.`,
          category: 'parcel',
          metadata: {
            taskId: completedTask.id,
            roomNumber: completedTask.roomNumber,
            trackingNumber: completedTask.trackingNumber,
            tenantName: completedTask.tenantName,
          },
        });
      }

      return ok(queue);
    } catch (error) {
      const mapped = mapDeliveryError(error);
      return err(mapped);
    }
  }
}
