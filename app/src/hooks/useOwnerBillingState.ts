'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/hooks/useRepositories';
import { calculateBillingSummary } from '@/services/billingSummary';
import { OwnerBillingState, EMPTY_OWNER_BILLING_STATE } from '@/services/ownerBillingState';

export function useOwnerBillingState(): {
  billingState: OwnerBillingState;
  refreshBillingState: () => void;
} {
  const { roomRepository, billingRepository } = useRepositories();

  const { data: billingState, refetch } = useQuery({
    queryKey: ['ownerBillingState'],
    queryFn: async (): Promise<OwnerBillingState> => {
      const roomsResult = await roomRepository.listRooms();
      if (!roomsResult.ok) {
        return EMPTY_OWNER_BILLING_STATE;
      }

      const rooms = roomsResult.value;
      const ownerBillingAggregationResult = await billingRepository.loadOwnerBillingAggregation(rooms);

      if (!ownerBillingAggregationResult.ok) {
        return EMPTY_OWNER_BILLING_STATE;
      }

      const {
        pendingSlipCount,
        debtQueue,
        activeDebtQueue,
        totalOutstanding,
      } = ownerBillingAggregationResult.value;
      const summary = calculateBillingSummary(rooms);

      return {
        rooms,
        summary,
        pendingSlipCount,
        debtQueue,
        activeDebtQueue,
        totalOutstanding,
      };
    },
    initialData: EMPTY_OWNER_BILLING_STATE,
  });

  useEffect(() => {
    const handleRefresh = () => refetch();
    window.addEventListener('storage', handleRefresh);
    window.addEventListener('estate_clarity.billing_state_updated', handleRefresh);

    return () => {
      window.removeEventListener('storage', handleRefresh);
      window.removeEventListener('estate_clarity.billing_state_updated', handleRefresh);
    };
  }, [refetch]);

  return {
    billingState,
    refreshBillingState: () => { refetch(); },
  };
}