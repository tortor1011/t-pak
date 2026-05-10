'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OwnerBillingState, EMPTY_OWNER_BILLING_STATE } from '@/services/ownerBillingState';

export function useOwnerBillingState(): {
  billingState: OwnerBillingState;
  refreshBillingState: () => void;
  isLoading: boolean;
  isError: boolean;
} {
  const { data: billingState, refetch, isLoading, isError } = useQuery({
    queryKey: ['ownerBillingState'],
    queryFn: async (): Promise<OwnerBillingState> => {
      const response = await fetch('/api/owner/billing-state');
      if (!response.ok) {
        const errText = await response.text();
        console.error('API Error:', response.status, errText);
        throw new Error('Failed to fetch billing state');
      }
      return response.json();
    },
  });

  const state = billingState ?? EMPTY_OWNER_BILLING_STATE;

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
    billingState: state,
    refreshBillingState: () => { refetch(); },
    isLoading,
    isError,
  };
}