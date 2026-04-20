import type { Result } from '@/repositories/common/Result';
import type {
  DeliveryProofInput,
  DeliveryTask,
  TenantParcelRequestInput,
} from '@/types/delivery';

export interface DeliveryRepository {
  listDeliveryTasks(): Promise<Result<DeliveryTask[]>>;
  findDeliveryTaskById(taskId: string): Promise<Result<DeliveryTask | null>>;
  createTaskFromTenantRequest(
    payload: TenantParcelRequestInput
  ): Promise<Result<DeliveryTask[]>>;
  startDeliveryTask(taskId: string): Promise<Result<DeliveryTask[]>>;
  completeDeliveryTask(
    taskId: string,
    payload: DeliveryProofInput
  ): Promise<Result<DeliveryTask[]>>;
}
