 'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { useOwnerBillingState } from '@/hooks/useOwnerBillingState';
import { formatCurrency } from '@/utils/currency';
import { getRelativeTime } from '@/utils/date';
import PageHeader from '@/components/layout/PageHeader';
import type { SlipVerificationQueueItem } from '@/repositories/billing/types';

export default function VerifySlipsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { billingState, isLoading, isError } = useOwnerBillingState();
  const slipQueue = useMemo(() => billingState.slipQueue ?? [], [billingState.slipQueue]);

  const pendingQueue = useMemo(
    () => slipQueue.filter((item) => item.decision === 'pending'),
    [slipQueue]
  );

  const reviewMutation = useMutation({
    mutationFn: async ({ slipId, decision }: { slipId: string; decision: 'approved' | 'rejected' }) => {
      const res = await fetch(`/api/bills/slips/${slipId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Review failed');
      }
      return res.json() as Promise<SlipVerificationQueueItem[]>;
    },
    onSuccess: (updatedQueue) => {
      // Update the billing state cache so the page reflects the new queue without a full refetch
      queryClient.setQueryData(['ownerBillingState'], (prev: { slipQueue?: SlipVerificationQueueItem[] } | undefined) =>
        prev ? { ...prev, slipQueue: updatedQueue } : prev
      );
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface pb-32 lg:pb-8">
        <PageHeader title={t('page.verifyPaymentsTitle')} onBack={() => router.back()} />
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto">
          <p className="text-on-surface-variant text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-surface pb-32 lg:pb-8">
        <PageHeader title={t('page.verifyPaymentsTitle')} onBack={() => router.back()} />
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto">
          <p className="text-error text-sm">Failed to load slip queue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader
        title={t('page.verifyPaymentsTitle')}
        onBack={() => router.back()}
        rightAction={
          <span className="bg-tertiary text-on-tertiary w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">
            {pendingQueue.length}
          </span>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto space-y-6 page-transition">
        {/* Queue Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-on-surface">{t('verify.queueTitle')}</h3>
          <span className="text-on-surface-variant text-sm font-medium">
            {t('verify.pendingCount', { count: pendingQueue.length })}
          </span>
        </div>

        {/* Slip Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingQueue.map((slip) => {
            return (
              <div
                key={slip.id}
                className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_20px_50px_rgba(18,28,40,0.05)] space-y-4"
              >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-black text-on-surface">
                      {t('common.room')} {slip.roomNumber}
                    </span>
                    {slip.isAmountMatch && (
                      <span className="bg-secondary-container text-on-secondary-container text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        {t('verify.match')}
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant font-medium text-sm">
                    {slip.tenantName}
                  </p>
                  <p className="text-xs text-outline mt-1">
                    {getRelativeTime(slip.uploadedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-on-surface">
                    {formatCurrency(slip.amount)}
                  </p>
                  {slip.detectedAmount && (
                    <p className="text-xs font-medium text-secondary">
                      {t('verify.aiDetected', { amount: formatCurrency(slip.detectedAmount) })}
                    </p>
                  )}
                </div>
              </div>

              {/* Slip Preview */}
              <div className="w-full h-32 bg-surface-container rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl">receipt</span>
                  <p className="text-xs font-medium mt-1">{t('verify.paymentSlip')}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => reviewMutation.mutate({ slipId: slip.id, decision: 'rejected' })}
                  disabled={reviewMutation.isPending && reviewMutation.variables?.slipId === slip.id}
                  className="flex-1 h-12 rounded-2xl border-2 border-error text-error font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewMutation.isPending && reviewMutation.variables?.slipId === slip.id && reviewMutation.variables.decision === 'rejected'
                    ? '...'
                    : t('verify.reject')}
                </button>
                <button
                  onClick={() => reviewMutation.mutate({ slipId: slip.id, decision: 'approved' })}
                  disabled={reviewMutation.isPending && reviewMutation.variables?.slipId === slip.id}
                  className="flex-1 h-12 rounded-2xl bg-secondary text-on-secondary font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewMutation.isPending && reviewMutation.variables?.slipId === slip.id && reviewMutation.variables.decision === 'approved'
                    ? '...'
                    : t('verify.approve')}
                </button>
              </div>

            </div>
            );
          })}
        </div>

        {pendingQueue.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block text-secondary">
              verified
            </span>
            <h3 className="text-xl font-bold mb-2">{t('verify.allClearTitle')}</h3>
            <p className="font-medium">{t('verify.allClearDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
