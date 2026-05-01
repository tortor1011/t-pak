/**
 * Server-only Prisma repositories.
 *
 * ⚠️ This module imports `pg` (Node.js native modules).
 * NEVER import this from client components or shared modules.
 * Use ONLY in:
 *   - API Route Handlers (app/api/...)
 *   - Server Components (without 'use client')
 *   - Server Actions
 */
import 'server-only';

import { PrismaRoomRepository } from '@/repositories/adapters/prisma/PrismaRoomRepository';
import { PrismaBillingRepository } from '@/repositories/adapters/prisma/PrismaBillingRepository';
import { PrismaComplaintsRepository } from '@/repositories/adapters/prisma/PrismaComplaintsRepository';
import { PrismaDeliveryRepository } from '@/repositories/adapters/prisma/PrismaDeliveryRepository';

// Singleton instances
const roomRepository = new PrismaRoomRepository();
const billingRepository = new PrismaBillingRepository();
const complaintsRepository = new PrismaComplaintsRepository();
const deliveryRepository = new PrismaDeliveryRepository();

export const serverRepositories = {
  roomRepository,
  billingRepository,
  complaintsRepository,
  deliveryRepository,
} as const;

export {
  roomRepository,
  billingRepository,
  complaintsRepository,
  deliveryRepository,
};
