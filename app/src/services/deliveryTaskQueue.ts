import {
  DeliveryTask,
  DeliveryProofInput,
  TenantParcelRequestInput,
  DeliveryTaskStatus,
} from '@/types/delivery';
import { MOCK_DELIVERY_TASKS } from '@/services/mockData';

const DELIVERY_TASK_STORAGE_KEY = 'estate_clarity.deliveryTaskQueue.v1';
export const DELIVERY_STATE_UPDATED_EVENT = 'estate_clarity.delivery_state_updated';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isDeliveryTaskStatus(value: unknown): value is DeliveryTaskStatus {
  return value === 'pending' || value === 'in-progress' || value === 'delivered';
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function sanitizeDeliveryTask(value: unknown): DeliveryTask | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const parsed = value as Record<string, unknown>;

  if (
    typeof parsed.id !== 'string' ||
    typeof parsed.tenantName !== 'string' ||
    typeof parsed.roomNumber !== 'string' ||
    typeof parsed.trackingNumber !== 'string' ||
    typeof parsed.phone !== 'string' ||
    !isStringOrNull(parsed.courierName) ||
    !isDeliveryTaskStatus(parsed.status) ||
    typeof parsed.requestedAt !== 'string' ||
    !isStringOrNull(parsed.startedAt) ||
    !isStringOrNull(parsed.deliveredAt) ||
    !isStringOrNull(parsed.proofPhotoUrl) ||
    !isStringOrNull(parsed.deliveryNote) ||
    typeof parsed.confirmationChecked !== 'boolean'
  ) {
    return null;
  }

  return {
    id: parsed.id,
    tenantName: parsed.tenantName,
    roomNumber: parsed.roomNumber,
    trackingNumber: parsed.trackingNumber,
    phone: parsed.phone,
    courierName: parsed.courierName,
    status: parsed.status,
    requestedAt: parsed.requestedAt,
    startedAt: parsed.startedAt,
    deliveredAt: parsed.deliveredAt,
    proofPhotoUrl: parsed.proofPhotoUrl,
    deliveryNote: parsed.deliveryNote,
    confirmationChecked: parsed.confirmationChecked,
  };
}

function sortDeliveryTasks(queue: DeliveryTask[]): DeliveryTask[] {
  return [...queue].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

function mergeBaseAndRuntimeTasks(base: DeliveryTask[], runtime: DeliveryTask[]): DeliveryTask[] {
  const mergedById = new Map<string, DeliveryTask>();

  for (const task of base) {
    mergedById.set(task.id, task);
  }

  for (const task of runtime) {
    mergedById.set(task.id, task);
  }

  return sortDeliveryTasks(Array.from(mergedById.values()));
}

function dispatchDeliveryStateUpdatedEvent(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(DELIVERY_STATE_UPDATED_EVENT));
}

function loadRuntimeTasks(): DeliveryTask[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(DELIVERY_TASK_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => sanitizeDeliveryTask(item))
      .filter((item): item is DeliveryTask => item !== null);
  } catch {
    return [];
  }
}

function saveRuntimeTasks(queue: DeliveryTask[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(DELIVERY_TASK_STORAGE_KEY, JSON.stringify(queue));
}

function ensureRequired(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

function createRuntimeTaskId(): string {
  return `delivery-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadDeliveryTasks(baseTasks: DeliveryTask[] = MOCK_DELIVERY_TASKS): DeliveryTask[] {
  return mergeBaseAndRuntimeTasks(baseTasks, loadRuntimeTasks());
}

export function saveDeliveryTasks(queue: DeliveryTask[]): void {
  saveRuntimeTasks(queue);
}

export function createDeliveryTaskFromTenantRequest(
  input: TenantParcelRequestInput
): DeliveryTask[] {
  const tenantName = ensureRequired(input.tenantName, 'tenantName');
  const roomNumber = ensureRequired(input.roomNumber, 'roomNumber');
  const trackingNumber = ensureRequired(input.trackingNumber, 'trackingNumber');
  const phone = ensureRequired(input.phone, 'phone');

  const nextTask: DeliveryTask = {
    id: createRuntimeTaskId(),
    tenantName,
    roomNumber,
    trackingNumber,
    phone,
    courierName: null,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    startedAt: null,
    deliveredAt: null,
    proofPhotoUrl: null,
    deliveryNote: null,
    confirmationChecked: false,
  };

  const queue = [nextTask, ...loadDeliveryTasks()];
  saveDeliveryTasks(queue);
  dispatchDeliveryStateUpdatedEvent();
  return queue;
}

export function markDeliveryTaskInProgress(taskId: string): DeliveryTask[] {
  const queue = loadDeliveryTasks();
  const target = queue.find((task) => task.id === taskId);

  if (!target) {
    throw new Error('Delivery task not found.');
  }

  if (target.status === 'delivered') {
    throw new Error('Delivered task cannot be moved back to in-progress.');
  }

  const nowIso = new Date().toISOString();

  const nextQueue: DeliveryTask[] = queue.map((task): DeliveryTask => {
    if (task.id !== taskId) {
      return task;
    }

    return {
      ...task,
      status: 'in-progress',
      startedAt: task.startedAt ?? nowIso,
    };
  });

  saveDeliveryTasks(nextQueue);
  dispatchDeliveryStateUpdatedEvent();
  return nextQueue;
}

export function completeDeliveryTask(
  taskId: string,
  payload: DeliveryProofInput
): DeliveryTask[] {
  const proofPhotoUrl = ensureRequired(payload.proofPhotoUrl, 'proofPhotoUrl');

  if (!payload.confirmationChecked) {
    throw new Error('confirmationChecked must be true.');
  }

  const queue = loadDeliveryTasks();
  const target = queue.find((task) => task.id === taskId);

  if (!target) {
    throw new Error('Delivery task not found.');
  }

  if (target.status === 'delivered') {
    throw new Error('Delivery task already completed.');
  }

  const nowIso = new Date().toISOString();
  const nextQueue: DeliveryTask[] = queue.map((task): DeliveryTask => {
    if (task.id !== taskId) {
      return task;
    }

    return {
      ...task,
      status: 'delivered',
      startedAt: task.startedAt ?? nowIso,
      deliveredAt: nowIso,
      proofPhotoUrl,
      deliveryNote: payload.deliveryNote?.trim() || null,
      confirmationChecked: true,
    };
  });

  saveDeliveryTasks(nextQueue);
  dispatchDeliveryStateUpdatedEvent();
  return nextQueue;
}

export function countDeliveryTasksByStatus(
  status: DeliveryTaskStatus,
  queue: DeliveryTask[] = loadDeliveryTasks()
): number {
  return queue.filter((task) => task.status === status).length;
}

export function findDeliveryTaskById(
  taskId: string,
  queue: DeliveryTask[] = loadDeliveryTasks()
): DeliveryTask | null {
  return queue.find((task) => task.id === taskId) ?? null;
}
