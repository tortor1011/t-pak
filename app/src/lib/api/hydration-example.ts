/**
 * ──────────────────────────────────────────────────
 *  SSR → TanStack Query Hydration Reference
 * ──────────────────────────────────────────────────
 *
 * This file demonstrates the pattern for fetching data
 * on the server (SSR) and hydrating it into a Client
 * Component using TanStack Query's HydrationBoundary.
 *
 * HOW IT WORKS:
 *
 * 1. A Server Component (page.tsx) calls a server-side
 *    data function (e.g., getBills) to pre-fetch data.
 *
 * 2. The prefetched data is serialized via dehydrate()
 *    and passed into <HydrationBoundary>.
 *
 * 3. A Client Component inside the HydrationBoundary
 *    calls useQuery with the SAME query key — TanStack
 *    Query automatically picks up the SSR data instead
 *    of re-fetching on mount.
 *
 * ──────────────────────────────────────────────────
 *
 * EXAMPLE — Server Component (page.tsx):
 *
 * ```tsx
 * import {
 *   dehydrate,
 *   HydrationBoundary,
 *   QueryClient,
 * } from '@tanstack/react-query';
 * import { getBills } from '@/lib/api/bills';
 * import BillListClient from './BillListClient';
 *
 * export default async function BillingPage() {
 *   const queryClient = new QueryClient();
 *
 *   await queryClient.prefetchQuery({
 *     queryKey: ['bills'],
 *     queryFn: () => getBills(),
 *   });
 *
 *   return (
 *     <HydrationBoundary state={dehydrate(queryClient)}>
 *       <BillListClient />
 *     </HydrationBoundary>
 *   );
 * }
 * ```
 *
 * EXAMPLE — Client Component (BillListClient.tsx):
 *
 * ```tsx
 * 'use client';
 *
 * import { useQuery } from '@tanstack/react-query';
 * import type { BillItem } from '@/types/billing';
 *
 * async function fetchBills(): Promise<BillItem[]> {
 *   const res = await fetch('/api/bills');
 *   if (!res.ok) throw new Error('Failed to fetch bills');
 *   return res.json();
 * }
 *
 * export default function BillListClient() {
 *   const { data: bills, isLoading } = useQuery<BillItem[]>({
 *     queryKey: ['bills'],       // ← MUST match server prefetch key
 *     queryFn: fetchBills,       // ← used for refetch/revalidation
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <ul>
 *       {bills?.map((bill) => (
 *         <li key={bill.id}>
 *           Room {bill.roomNumber} — ฿{bill.totalAmount}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * KEY POINTS:
 * - queryKey MUST be identical on server and client
 * - queryFn on client is used for refetch/revalidation only
 * - Initial render uses SSR data (no loading spinner)
 * - Client takes over for subsequent interactions
 */

export {};
