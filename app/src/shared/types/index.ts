/**
 * Shared type definitions for T PAK Dormitory ERP.
 *
 * Both the Owner app (`app/`) and Tenant app (`tenent/`) reference these
 * types via the `@shared/*` tsconfig path alias.
 *
 * ⚠️  Do NOT import app-specific code here. This package must remain
 *     dependency-free and importable by any app in the monorepo.
 */

// ─── Billing ───

/**
 * Canonical billing status used across both Owner and Tenant apps.
 * Prisma enum uses underscores (e.g. `pending_payment`); frontend uses hyphens.
 */
export type BillingStatus =
  | 'draft'
  | 'pending'
  | 'unpaid'
  | 'pending-payment'
  | 'paid'
  | 'overdue'
  | 'none';

/**
 * Nested utility usage breakdown shown in the Tenant bill transparency view.
 * Represents: (current - previous) × unitPrice = total.
 */
export interface UtilityUsage {
  previous: number;
  current: number;
  unitPrice: number;
  total: number;
}

// ─── Maintenance / Complaints ───

export type MaintenanceStatus = 'new' | 'in-progress' | 'resolved';

export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'furniture'
  | 'cleaning'
  | 'noise'
  | 'appliance'
  | 'other';

// ─── Delivery / Parcels ───

export type DeliveryTaskStatus = 'pending' | 'in-progress' | 'delivered' | 'returned';

/**
 * Payload a Tenant submits when requesting room delivery of a parcel.
 * The Owner app creates a `DeliveryTask` from this input.
 */
export interface TenantParcelRequestInput {
  tenantName: string;
  roomNumber: string;
  trackingNumber: string;
  phone: string;
  notes?: string;
}

/**
 * Proof-of-delivery payload submitted by Staff/Maid when completing a delivery.
 */
export interface DeliveryProofInput {
  proofPhotoUrl: string;
  deliveryNote?: string;
  confirmationChecked: boolean;
}
