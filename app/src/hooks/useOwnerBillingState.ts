'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  buildOwnerBillingState,
  buildOwnerBillingStateResult,
  type OwnerBillingState,
} from '@/services/ownerBillingState';

export function useOwnerBillingState(
): {
  billingState: OwnerBillingState;
  refreshBillingState: () => void;
} {
  const [billingState, setBillingState] = useState<OwnerBillingState>(() =>
    buildOwnerBillingState()
  );

  const refreshBillingState = useCallback(() => {
    const nextState = buildOwnerBillingStateResult();
    if (nextState.ok) {
      setBillingState(nextState.value);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('storage', refreshBillingState);
    window.addEventListener(
      'estate_clarity.billing_state_updated',
      refreshBillingState
    );

    return () => {
      window.removeEventListener('storage', refreshBillingState);
      window.removeEventListener(
        'estate_clarity.billing_state_updated',
        refreshBillingState
      );
    };
  }, [refreshBillingState]);

  return {
    billingState,
    refreshBillingState,
  };
}