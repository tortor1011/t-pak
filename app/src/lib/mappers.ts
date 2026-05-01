/**
 * Mapper utilities to convert between Prisma enum values (underscores)
 * and frontend TypeScript types (hyphens).
 *
 * Prisma enums use underscores (e.g. pending_payment, in_progress, new_ticket)
 * Frontend types use hyphens (e.g. 'pending-payment', 'in-progress', 'new')
 */

import type {
  BillingStatus as PrismaBillingStatus,
  ComplaintStatus as PrismaComplaintStatus,
  DeliveryTaskStatus as PrismaDeliveryTaskStatus,
  SlipDecision as PrismaSlipDecision,
} from '@/generated/prisma';
import type { BillingStatus } from '@/types/room';
import type { ComplaintStatus } from '@/types/complaint';
import type { DeliveryTaskStatus } from '@/types/delivery';
import type { SlipDecision } from '@/repositories/billing/types';

// ─── Billing Status ───

const billingStatusToFrontend: Record<PrismaBillingStatus, BillingStatus> = {
  draft: 'draft',
  pending: 'pending',
  unpaid: 'unpaid',
  pending_payment: 'pending-payment',
  paid: 'paid',
  overdue: 'overdue',
  none: 'none',
};

const billingStatusToPrisma: Record<BillingStatus, PrismaBillingStatus> = {
  draft: 'draft',
  pending: 'pending',
  unpaid: 'unpaid',
  'pending-payment': 'pending_payment',
  paid: 'paid',
  overdue: 'overdue',
  none: 'none',
};

export function mapBillingStatusToFrontend(status: PrismaBillingStatus): BillingStatus {
  return billingStatusToFrontend[status];
}

export function mapBillingStatusToPrisma(status: BillingStatus): PrismaBillingStatus {
  return billingStatusToPrisma[status];
}

// ─── Complaint Status ───

const complaintStatusToFrontend: Record<PrismaComplaintStatus, ComplaintStatus> = {
  new_ticket: 'new',
  in_progress: 'in-progress',
  resolved: 'resolved',
};

const complaintStatusToPrisma: Record<ComplaintStatus, PrismaComplaintStatus> = {
  new: 'new_ticket',
  'in-progress': 'in_progress',
  resolved: 'resolved',
};

export function mapComplaintStatusToFrontend(status: PrismaComplaintStatus): ComplaintStatus {
  return complaintStatusToFrontend[status];
}

export function mapComplaintStatusToPrisma(status: ComplaintStatus): PrismaComplaintStatus {
  return complaintStatusToPrisma[status];
}

// ─── Delivery Task Status ───

const deliveryStatusToFrontend: Record<PrismaDeliveryTaskStatus, DeliveryTaskStatus> = {
  pending: 'pending',
  in_progress: 'in-progress',
  delivered: 'delivered',
  returned: 'returned',
};

const deliveryStatusToPrisma: Record<DeliveryTaskStatus, PrismaDeliveryTaskStatus> = {
  pending: 'pending',
  'in-progress': 'in_progress',
  delivered: 'delivered',
  returned: 'returned',
};

export function mapDeliveryStatusToFrontend(status: PrismaDeliveryTaskStatus): DeliveryTaskStatus {
  return deliveryStatusToFrontend[status];
}

export function mapDeliveryStatusToPrisma(status: DeliveryTaskStatus): PrismaDeliveryTaskStatus {
  return deliveryStatusToPrisma[status];
}

// ─── Slip Decision ───

const slipDecisionToFrontend: Record<PrismaSlipDecision, SlipDecision> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

const slipDecisionToPrisma: Record<SlipDecision, PrismaSlipDecision> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

export function mapSlipDecisionToFrontend(decision: PrismaSlipDecision): SlipDecision {
  return slipDecisionToFrontend[decision];
}

export function mapSlipDecisionToPrisma(decision: SlipDecision): PrismaSlipDecision {
  return slipDecisionToPrisma[decision];
}

// ─── Date Helpers ───

/** Convert a Date to ISO string, or null if undefined */
export function dateToISOString(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null;
}

/** Convert a Date to YYYY-MM-DD string */
export function dateToDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
