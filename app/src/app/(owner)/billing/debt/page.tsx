'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOwnerBillingState } from '@/hooks/useOwnerBillingState';
import {
  settleDebtByRoomNumber,
  sendBulkDebtRemindersByIds,
  sendDebtReminder,
  type DebtCollectionQueueItem,
} from '@/services/debtReminderQueue';
import { setRoomBillingStatusOverride } from '@/services/roomBillingStatusOverrides';
import { formatCurrency } from '@/utils/currency';
import { getRelativeTime } from '@/utils/date';
import PageHeader from '@/components/layout/PageHeader';

export default function DebtCollectionPage() {
  const router = useRouter();
  const { billingState, refreshBillingState } = useOwnerBillingState();
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [activeReminderId, setActiveReminderId] = useState<string | null>(null);
  const [activeSettlementRoom, setActiveSettlementRoom] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const debts = billingState.activeDebtQueue;
  const totalOutstanding = billingState.totalOutstanding;
  const isActionInProgress =
    isBulkSending ||
    Boolean(activeReminderId) ||
    Boolean(activeSettlementRoom);

  const handleSendBulkReminder = async () => {
    if (isActionInProgress || debts.length === 0) return;

    setIsBulkSending(true);
    setFeedback(null);

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 600);
      });

      const debtIds = debts.map((debt) => debt.id);
      sendBulkDebtRemindersByIds(debtIds);
      refreshBillingState();
      setFeedback(`Bulk reminder sent to ${debtIds.length} room(s).`);
    } finally {
      setIsBulkSending(false);
    }
  };

  const handleSendSingleReminder = async (debt: DebtCollectionQueueItem) => {
    if (isActionInProgress) return;

    setActiveReminderId(debt.id);
    setFeedback(null);

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 450);
      });

      sendDebtReminder(debt.id);
      refreshBillingState();
      setFeedback(`Reminder sent to Room ${debt.roomNumber}.`);
    } finally {
      setActiveReminderId(null);
    }
  };

  const handleCallTenant = (phone: string) => {
    if (isActionInProgress) return;

    if (!phone || phone.trim() === '' || phone === '-') {
      setFeedback('No phone number is available for this room.');
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  const handleMarkSettled = async (debt: DebtCollectionQueueItem) => {
    if (isActionInProgress) return;

    setActiveSettlementRoom(debt.roomNumber);
    setFeedback(null);

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 500);
      });

      settleDebtByRoomNumber(debt.roomNumber);
      setRoomBillingStatusOverride(debt.roomNumber, 'paid');
      window.dispatchEvent(new Event('estate_clarity.billing_state_updated'));
      refreshBillingState();
      setFeedback(`Room ${debt.roomNumber} marked as settled.`);
    } finally {
      setActiveSettlementRoom(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader
        title="Debt Collection"
        onBack={() => router.back()}
        rightAction={
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-slate-500">history</span>
          </button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto space-y-8 page-transition">
        {/* Outstanding Summary */}
        <section className="bg-tertiary-fixed rounded-3xl p-6 shadow-[0_20px_50px_rgba(18,28,40,0.05)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-on-tertiary-fixed-variant text-sm font-bold uppercase tracking-wider">
                Total Outstanding
              </p>
              <h2 className="text-4xl font-black text-on-tertiary-fixed tracking-tight mt-1">
                {formatCurrency(totalOutstanding)}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-2xl">
                warning
              </span>
            </div>
          </div>
          <button
            onClick={handleSendBulkReminder}
            disabled={isActionInProgress || debts.length === 0}
            className={`w-full h-12 bg-tertiary text-on-tertiary rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              isActionInProgress || debts.length === 0
                ? 'opacity-60 cursor-not-allowed'
                : 'active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-lg">send</span>
            {isBulkSending ? 'Sending Reminders...' : 'Send Bulk Reminder'}
          </button>
        </section>

        {feedback && (
          <p className="text-sm font-medium text-secondary bg-secondary-container/30 rounded-xl px-4 py-3">
            {feedback}
          </p>
        )}

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-on-surface">Overdue Rooms</h3>
          {debts.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant bg-surface-container-lowest rounded-3xl">
              <span className="material-symbols-outlined text-5xl mb-4 block text-secondary">
                verified
              </span>
              <h3 className="text-xl font-bold mb-2">No Active Debts</h3>
              <p className="font-medium">All overdue balances are currently cleared.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {debts.map((debt) => {
                const isSendingForDebt = activeReminderId === debt.id;
                const isSettlingForDebt = activeSettlementRoom === debt.roomNumber;
                const hasCallablePhone = debt.phone.trim() !== '' && debt.phone !== '-';

                return (
                  <div
                    key={debt.id}
                    className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_10px_40px_rgba(18,28,40,0.03)] space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-black text-on-surface">
                            Room {debt.roomNumber}
                          </span>
                          <span className="bg-error text-on-error text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            {debt.monthsOverdue} {debt.monthsOverdue > 1 ? 'MONTHS' : 'MONTH'} OVERDUE
                          </span>
                        </div>
                        <p className="text-on-surface-variant font-medium text-sm">{debt.tenantName}</p>
                      </div>
                      <p className="text-xl font-bold text-tertiary">
                        {formatCurrency(debt.totalOutstanding)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>
                        {debt.lastReminder
                          ? `Last reminder: ${getRelativeTime(debt.lastReminder)}`
                          : 'No reminder sent yet'}
                      </span>
                    </div>

                    <div className="text-xs text-on-surface-variant font-medium">
                      {debt.reminderCount} reminder{debt.reminderCount === 1 ? '' : 's'} sent
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSendSingleReminder(debt)}
                        disabled={isActionInProgress}
                        className={`h-12 btn-primary-gradient text-on-primary font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                          isActionInProgress
                            ? 'opacity-60 cursor-not-allowed'
                            : 'active:scale-95'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">send</span>
                        {isSendingForDebt ? 'Sending...' : 'Send Reminder'}
                      </button>
                      <button
                        onClick={() => handleCallTenant(debt.phone)}
                        disabled={isActionInProgress || !hasCallablePhone}
                        className={`h-12 border-2 border-primary text-primary font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                          isActionInProgress || !hasCallablePhone
                            ? 'opacity-60 cursor-not-allowed'
                            : 'active:scale-95'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">call</span>
                        {hasCallablePhone ? 'Call Tenant' : 'No Phone'}
                      </button>
                    </div>

                    <button
                      onClick={() => handleMarkSettled(debt)}
                      disabled={isActionInProgress}
                      className={`w-full h-11 border border-secondary/50 text-secondary font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                        isActionInProgress
                          ? 'opacity-60 cursor-not-allowed'
                          : 'active:scale-95 hover:bg-secondary-container/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">task_alt</span>
                      {isSettlingForDebt ? 'Settling...' : 'Mark as Settled'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
