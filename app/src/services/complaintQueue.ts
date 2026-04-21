import { MOCK_COMPLAINTS } from '@/services/mockData';
import type { Complaint, ComplaintStatus } from '@/types/complaint';

const COMPLAINT_QUEUE_STORAGE_KEY = 'estate_clarity.complaintQueue.v1';
export const COMPLAINT_STATE_UPDATED_EVENT = 'estate_clarity.complaint_state_updated';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isComplaintStatus(value: unknown): value is ComplaintStatus {
  return value === 'new' || value === 'in-progress' || value === 'resolved';
}

function isComplaintCategory(value: unknown): value is Complaint['category'] {
  return (
    value === 'plumbing' ||
    value === 'electrical' ||
    value === 'appliance' ||
    value === 'furniture' ||
    value === 'pest' ||
    value === 'noise' ||
    value === 'other'
  );
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function sanitizeComplaint(value: unknown): Complaint | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const parsed = value as Record<string, unknown>;

  if (
    typeof parsed.id !== 'string' ||
    typeof parsed.roomNumber !== 'string' ||
    typeof parsed.tenantName !== 'string' ||
    !isComplaintCategory(parsed.category) ||
    typeof parsed.title !== 'string' ||
    typeof parsed.description !== 'string' ||
    !isComplaintStatus(parsed.status) ||
    !isStringOrNull(parsed.photoUrl) ||
    typeof parsed.permissionToEnter !== 'boolean' ||
    typeof parsed.createdAt !== 'string' ||
    !isStringOrNull(parsed.resolvedAt)
  ) {
    return null;
  }

  return {
    id: parsed.id,
    roomNumber: parsed.roomNumber,
    tenantName: parsed.tenantName,
    category: parsed.category,
    title: parsed.title,
    description: parsed.description,
    status: parsed.status,
    photoUrl: parsed.photoUrl,
    permissionToEnter: parsed.permissionToEnter,
    createdAt: parsed.createdAt,
    resolvedAt: parsed.resolvedAt,
  };
}

function sortComplaints(queue: Complaint[]): Complaint[] {
  return [...queue].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function mergeBaseAndRuntimeComplaints(
  baseQueue: Complaint[],
  runtimeQueue: Complaint[]
): Complaint[] {
  const queueById = new Map<string, Complaint>();

  for (const complaint of baseQueue) {
    queueById.set(complaint.id, complaint);
  }

  for (const complaint of runtimeQueue) {
    queueById.set(complaint.id, complaint);
  }

  return sortComplaints(Array.from(queueById.values()));
}

function dispatchComplaintStateUpdatedEvent(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(COMPLAINT_STATE_UPDATED_EVENT));
}

function loadRuntimeComplaints(): Complaint[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(COMPLAINT_QUEUE_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => sanitizeComplaint(item))
      .filter((item): item is Complaint => item !== null);
  } catch {
    return [];
  }
}

export function loadComplaintQueue(
  baseQueue: Complaint[] = MOCK_COMPLAINTS
): Complaint[] {
  return mergeBaseAndRuntimeComplaints(baseQueue, loadRuntimeComplaints());
}

export function saveComplaintQueue(queue: Complaint[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(COMPLAINT_QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

export function getNextComplaintStatus(
  status: ComplaintStatus
): ComplaintStatus | null {
  if (status === 'new') {
    return 'in-progress';
  }

  if (status === 'in-progress') {
    return 'resolved';
  }

  return null;
}

function validateStatusTransition(
  currentStatus: ComplaintStatus,
  nextStatus: ComplaintStatus
): void {
  const order: Record<ComplaintStatus, number> = {
    new: 0,
    'in-progress': 1,
    resolved: 2,
  };

  if (order[nextStatus] < order[currentStatus]) {
    throw new Error('Complaint status cannot be moved backwards.');
  }
}

export function updateComplaintStatus(
  complaintId: string,
  nextStatus: ComplaintStatus
): Complaint[] {
  const queue = loadComplaintQueue();
  const target = queue.find((item) => item.id === complaintId);

  if (!target) {
    throw new Error('Complaint not found.');
  }

  validateStatusTransition(target.status, nextStatus);

  const nextQueue: Complaint[] = queue.map((item): Complaint => {
    if (item.id !== complaintId || item.status === nextStatus) {
      return item;
    }

    return {
      ...item,
      status: nextStatus,
      resolvedAt: nextStatus === 'resolved' ? new Date().toISOString() : null,
    };
  });

  saveComplaintQueue(nextQueue);
  dispatchComplaintStateUpdatedEvent();

  return nextQueue;
}
