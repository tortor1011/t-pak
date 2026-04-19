import type { Result } from '@/repositories/common/Result';
import type {
  DeliveryProofInput,
  DeliveryTask,
  TenantParcelRequestInput,
} from '@/types/delivery';

export interface DeliveryRepository {
  listDeliveryTasks(): Result<DeliveryTask[]>;
  findDeliveryTaskById(taskId: string): Result<DeliveryTask | null>;
  createTaskFromTenantRequest(
    payload: TenantParcelRequestInput
  ): Result<DeliveryTask[]>;
  startDeliveryTask(taskId: string): Result<DeliveryTask[]>;
  completeDeliveryTask(
    taskId: string,
    payload: DeliveryProofInput
  ): Result<DeliveryTask[]>;
}
