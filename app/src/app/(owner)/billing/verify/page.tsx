'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getPendingSlipVerificationQueue,
  loadSlipVerificationQueue,
  reviewSlipVerification,
  type SlipVerificationQueueItem,
} from '@/services/slipVerificationQueue';
import { formatCurrency } from '@/utils/currency';
import { getRelativeTime } from '@/utils/date';
import PageHeader from '@/components/layout/PageHeader';

export default function VerifySlipsPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<SlipVerificationQueueItem[]>(() =>
    loadSlipVerificationQueue()
  );
  const [activeAction, setActiveAction] = useState<{
    slipId: string;
    decision: 'approved' | 'rejected';
  } | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const pendingQueue = useMemo(
    () => getPendingSlipVerificationQueue(queue),
    [queue]
  );

  const handleReview = async (
    slip: SlipVerificationQueueItem,
    decision: 'approved' | 'rejected'
  ) => {
    if (activeAction) return;

    setActiveAction({ slipId: slip.id, decision });
    setActionFeedback(null);

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 450);
      });

      const nextQueue = reviewSlipVerification(slip.id, decision);
      setQueue(nextQueue);

      setActionFeedback(
        decision === 'approved'
          ? `Room ${slip.roomNumber} was approved and marked as paid.`
          : `Room ${slip.roomNumber} was rejected and moved back to unpaid.`
      );
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader
        title="Verify Payments"
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
          <h3 className="text-lg font-bold text-on-surface">Verification Queue</h3>
          <span className="text-on-surface-variant text-sm font-medium">
            {pendingQueue.length} pending
          </span>
        </div>

        {actionFeedback && (
          <p className="text-sm font-medium text-secondary bg-secondary-container/30 rounded-xl px-4 py-3">
            {actionFeedback}
          </p>
        )}

        {/* Slip Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingQueue.map((slip) => {
            const isActioningThisSlip = activeAction?.slipId === slip.id;
            const isApproving =
              isActioningThisSlip && activeAction?.decision === 'approved';
            const isRejecting =
              isActioningThisSlip && activeAction?.decision === 'rejected';

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
                      Room {slip.roomNumber}
                    </span>
                    {slip.isAmountMatch && (
                      <span className="bg-secondary-container text-on-secondary-container text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        MATCH
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
                      AI detected: {formatCurrency(slip.detectedAmount)}
                    </p>
                  )}
                </div>
              </div>

              {/* Slip Preview */}
              <div className="w-full h-32 bg-surface-container rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl">receipt</span>
                  <p className="text-xs font-medium mt-1">Payment Slip</p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleReview(slip, 'approved')}
                  disabled={Boolean(activeAction)}
                  className={`h-14 btn-primary-gradient text-on-primary font-bold rounded-xl transition-transform flex items-center justify-center gap-2 ${
                    activeAction
                      ? 'opacity-60 cursor-not-allowed'
                      : 'active:scale-95'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  {isApproving ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReview(slip, 'rejected')}
                  disabled={Boolean(activeAction)}
                  className={`h-14 bg-error-container/20 text-error font-bold rounded-xl transition-transform flex items-center justify-center gap-2 ${
                    activeAction
                      ? 'opacity-60 cursor-not-allowed'
                      : 'active:scale-95'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">cancel</span>
                  {isRejecting ? 'Rejecting...' : 'Reject'}
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
            <h3 className="text-xl font-bold mb-2">All Clear!</h3>
            <p className="font-medium">No slips waiting for verification</p>
          </div>
        )}
      </div>
    </div>
  );
}
