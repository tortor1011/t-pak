'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/layout/PageHeader';
import FilterTabs from '@/components/ui/FilterTabs';
import { useLanguage } from '@/hooks/useLanguage';
import { useRepositories } from '@/hooks/useRepositories';
import {
  buildRoomAdditionalChargeContext,
  calculateAdditionalChargeForRoomNumber,
} from '@/services/additionalChargeRules';
import type { NotificationChannel } from '@/types/notification';
import type { Room } from '@/types/room';
import { formatCurrency } from '@/utils/currency';

type DeliveryMode = 'online' | 'physical';

interface PrintableBillRoom {
  roomNumber: string;
  tenantName: string;
  baseRent: string;
  additionalCharge: string;
  totalAmount: string;
}

interface PrintableBillDocument {
  title: string;
  subtitle: string;
  generatedAtLabel: string;
  generatedAtValue: string;
  dueDateLabel: string;
  dueDateValue: string;
  rooms: PrintableBillRoom[];
  grandTotalLabel: string;
  grandTotal: string;
}

function getRoomAdditionalCharge(
  roomNumber: string,
  additionalChargeContext: ReturnType<typeof buildRoomAdditionalChargeContext>
): number {
  return calculateAdditionalChargeForRoomNumber(roomNumber, additionalChargeContext);
}

function getRoomTotalAmount(
  room: Room,
  additionalChargeContext: ReturnType<typeof buildRoomAdditionalChargeContext>
): number {
  return room.baseRent + getRoomAdditionalCharge(room.number, additionalChargeContext);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildPrintableDocumentHtml(document: PrintableBillDocument): string {
  const rows = document.rooms
    .map((room) => {
      return `
        <tr>
          <td>${escapeHtml(room.roomNumber)}</td>
          <td>${escapeHtml(room.tenantName)}</td>
          <td>${escapeHtml(room.baseRent)}</td>
          <td>${escapeHtml(room.additionalCharge)}</td>
          <td>${escapeHtml(room.totalAmount)}</td>
        </tr>
      `;
    })
    .join('');

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(document.title)}</title>
    <style>
      :root {
        font-family: Kanit, sans-serif;
        color: #0f172a;
      }

      body {
        margin: 24px;
        background: #f8fafc;
      }

      .sheet {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 20px;
      }

      h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
      }

      .subtitle {
        margin: 6px 0 18px;
        color: #475569;
        font-size: 13px;
      }

      .meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .meta-item {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 10px 12px;
      }

      .meta-item p {
        margin: 0;
      }

      .meta-label {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .meta-value {
        margin-top: 4px;
        font-weight: 600;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
      }

      th,
      td {
        border: 1px solid #e2e8f0;
        padding: 10px;
        text-align: left;
        font-size: 12px;
      }

      th {
        background: #eff6ff;
        color: #1e293b;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .total {
        margin-top: 14px;
        display: flex;
        justify-content: flex-end;
        font-size: 14px;
        font-weight: 700;
      }

      @media print {
        body {
          margin: 0;
          background: #ffffff;
        }

        .sheet {
          border: none;
          border-radius: 0;
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <main class="sheet">
      <h1>${escapeHtml(document.title)}</h1>
      <p class="subtitle">${escapeHtml(document.subtitle)}</p>

      <section class="meta">
        <article class="meta-item">
          <p class="meta-label">${escapeHtml(document.generatedAtLabel)}</p>
          <p class="meta-value">${escapeHtml(document.generatedAtValue)}</p>
        </article>
        <article class="meta-item">
          <p class="meta-label">${escapeHtml(document.dueDateLabel)}</p>
          <p class="meta-value">${escapeHtml(document.dueDateValue)}</p>
        </article>
      </section>

      <table>
        <thead>
          <tr>
            <th>Room</th>
            <th>Tenant</th>
            <th>Base Rent</th>
            <th>Additional</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <p class="total">${escapeHtml(document.grandTotalLabel)} ${escapeHtml(document.grandTotal)}</p>
    </main>

    <script>
      window.addEventListener('load', () => {
        window.focus();
        window.print();
      });
    </script>
  </body>
</html>
`;
}

export default function GenerateBillsPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { notificationRepository } = useRepositories(); // notification stays mock (future feature)

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: () => fetch('/api/rooms').then((r) => r.json()),
  });

  const additionalChargeContext = useMemo(
    () => buildRoomAdditionalChargeContext(),
    []
  );

  const activeAdditionalChargeRuleCount = additionalChargeContext.activeRuleIds.length;

  const occupiedRooms = useMemo(
    () => rooms.filter((room) => room.occupancy === 'occupied'),
    [rooms]
  );

  const onlineEligibleRooms = useMemo(
    () => occupiedRooms.filter((room) => room.isConnectedWithDorm === true),
    [occupiedRooms]
  );

  const physicalEligibleRooms = useMemo(
    () => occupiedRooms.filter((room) => room.isConnectedWithDorm !== true),
    [occupiedRooms]
  );

  const [activeTab, setActiveTab] = useState<DeliveryMode>('online');
  const [selectedOnlineIds, setSelectedOnlineIds] = useState<Set<string>>(
    () => new Set(onlineEligibleRooms.map((room) => room.id))
  );
  const [selectedPhysicalIds, setSelectedPhysicalIds] = useState<Set<string>>(
    () => new Set(physicalEligibleRooms.map((room) => room.id))
  );
  const [enabledChannels, setEnabledChannels] = useState<
    Record<NotificationChannel, boolean>
  >({
    app: true,
    line: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);

  const tabs = useMemo(
    () => [
      {
        key: 'online',
        label: t('generate.tabOnlineDelivery'),
        count: onlineEligibleRooms.length,
      },
      {
        key: 'physical',
        label: t('generate.tabPrintPdf'),
        count: physicalEligibleRooms.length,
      },
    ],
    [onlineEligibleRooms.length, physicalEligibleRooms.length, t]
  );

  const activeRooms = activeTab === 'online' ? onlineEligibleRooms : physicalEligibleRooms;
  const activeSelectedIds = activeTab === 'online' ? selectedOnlineIds : selectedPhysicalIds;

  const selectedRooms = useMemo(
    () => activeRooms.filter((room) => activeSelectedIds.has(room.id)),
    [activeRooms, activeSelectedIds]
  );

  const enabledOnlineChannels = useMemo<NotificationChannel[]>(() => {
    const channels: NotificationChannel[] = [];
    if (enabledChannels.app) {
      channels.push('app');
    }
    if (enabledChannels.line) {
      channels.push('line');
    }
    return channels;
  }, [enabledChannels]);

  const selectRoomIdsForActiveTab = (
    updater: (previous: Set<string>) => Set<string>
  ): void => {
    if (activeTab === 'online') {
      setSelectedOnlineIds((previous) => updater(previous));
      return;
    }

    setSelectedPhysicalIds((previous) => updater(previous));
  };

  const toggleRoom = (id: string): void => {
    selectRoomIdsForActiveTab((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = (): void => {
    if (activeSelectedIds.size === activeRooms.length) {
      selectRoomIdsForActiveTab(() => new Set());
      return;
    }

    selectRoomIdsForActiveTab(() => new Set(activeRooms.map((room) => room.id)));
  };

  const handleTabChange = (nextTab: string): void => {
    if (nextTab === 'online' || nextTab === 'physical') {
      setActiveTab(nextTab);
      setActionError(null);
      setGenerationFeedback(null);
    }
  };

  const toggleOnlineChannel = (channel: NotificationChannel): void => {
    setEnabledChannels((previous) => ({
      ...previous,
      [channel]: !previous[channel],
    }));
    setActionError(null);
  };

  const revenueBreakdown = useMemo(() => {
    return selectedRooms.reduce(
      (accumulator, room) => {
        const roomAdditionalCharge = getRoomAdditionalCharge(
          room.number,
          additionalChargeContext
        );
        accumulator.baseRevenue += room.baseRent;
        accumulator.additionalRevenue += roomAdditionalCharge;
        return accumulator;
      },
      {
        baseRevenue: 0,
        additionalRevenue: 0,
      }
    );
  }, [additionalChargeContext, selectedRooms]);

  const estimatedRevenue = revenueBreakdown.baseRevenue + revenueBreakdown.additionalRevenue;

  const handleGenerateBills = async (): Promise<void> => {
    if (isGenerating || selectedRooms.length === 0) {
      return;
    }

    setIsGenerating(true);
    setActionError(null);
    setGenerationFeedback(null);

    try {
      if (activeTab === 'online') {
        if (enabledOnlineChannels.length === 0) {
          setActionError(t('generate.selectAtLeastOneChannel'));
          return;
        }

        let queuedCount = 0;

        for (const room of selectedRooms) {
          const totalAmount = getRoomTotalAmount(room, additionalChargeContext);
          const sendResult = notificationRepository.sendNotification(
            enabledOnlineChannels,
            {
              recipient: room.tenantId ?? room.number,
              title: t('generate.onlineNotificationTitle', { room: room.number }),
              body: t('generate.onlineNotificationBody', {
                room: room.number,
                total: formatCurrency(totalAmount),
              }),
              category: 'billing',
              metadata: {
                roomNumber: room.number,
                tenantName: room.tenantName ?? t('roomCard.vacant'),
                totalAmount: String(totalAmount),
              },
            }
          );

          if (!sendResult.ok) {
            setActionError(sendResult.error.message);
            return;
          }

          queuedCount += sendResult.value.length;
        }

        setGenerationFeedback(
          t('generate.onlineSentFeedback', {
            count: selectedRooms.length,
            queued: queuedCount,
          })
        );

        return;
      }

      const printableRows: PrintableBillRoom[] = selectedRooms.map((room) => {
        const additionalCharge = getRoomAdditionalCharge(
          room.number,
          additionalChargeContext
        );
        return {
          roomNumber: room.number,
          tenantName: room.tenantName ?? t('roomCard.vacant'),
          baseRent: formatCurrency(room.baseRent),
          additionalCharge: formatCurrency(additionalCharge),
          totalAmount: formatCurrency(room.baseRent + additionalCharge),
        };
      });

      const dateLocale = language === 'th' ? 'th-TH' : 'en-US';
      const generatedAtValue = new Intl.DateTimeFormat(dateLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const dueDateValue = new Intl.DateTimeFormat(dateLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(dueDate);

      const printWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (!printWindow) {
        setActionError(t('generate.popupBlocked'));
        return;
      }

      const html = buildPrintableDocumentHtml({
        title: t('generate.printDocumentTitle'),
        subtitle: t('generate.printDocumentSubtitle'),
        generatedAtLabel: t('generate.printGeneratedAt'),
        generatedAtValue,
        dueDateLabel: t('generate.printDueDate'),
        dueDateValue,
        rooms: printableRows,
        grandTotalLabel: t('generate.estimatedRevenue'),
        grandTotal: formatCurrency(estimatedRevenue),
      });

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      setGenerationFeedback(
        t('generate.pdfReadyFeedback', {
          count: selectedRooms.length,
          total: formatCurrency(estimatedRevenue),
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const modeHint =
    activeTab === 'online'
      ? t('generate.onlineModeHint')
      : t('generate.physicalModeHint');

  const modeEmptyState =
    activeTab === 'online'
      ? t('generate.noOnlineEligibleRooms')
      : t('generate.noPhysicalEligibleRooms');

  const isSelectAll = activeSelectedIds.size === activeRooms.length;

  return (
    <div className="min-h-screen bg-surface pb-32 lg:pb-8">
      <PageHeader
        title={t('page.generateBillsTitle')}
        onBack={() => router.back()}
        rightAction={
          <span className="material-symbols-outlined text-slate-400">more_vert</span>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto space-y-8 page-transition">
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-on-surface">
            {t('generate.deliveryMode')}
          </h3>
          <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
        </section>

        <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0_20px_50px_rgba(18,28,40,0.05)] space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-on-surface-variant font-semibold text-sm uppercase tracking-wider mb-1">
                {t('generate.totalPending')}
              </p>
              <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">
                {activeSelectedIds.size}{' '}
                <span className="text-xl font-medium text-slate-400">{t('common.rooms')}</span>
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">
                pending_actions
              </span>
            </div>
          </div>
          <div className="pt-4 space-y-1">
            <p className="text-on-surface-variant text-sm font-medium">{t('generate.estimatedRevenue')}</p>
            <p className="text-2xl font-bold text-on-surface">
              {formatCurrency(estimatedRevenue)}
            </p>
            {activeAdditionalChargeRuleCount > 0 && (
              <p className="text-xs font-medium text-on-surface-variant">
                {t('generate.includesAdditionalCharges', {
                  amount: formatCurrency(revenueBreakdown.additionalRevenue),
                  count: activeAdditionalChargeRuleCount,
                })}
              </p>
            )}
          </div>
        </section>

        {activeTab === 'online' && (
          <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_20px_50px_rgba(18,28,40,0.05)] space-y-4">
            <div>
              <p className="text-sm font-bold tracking-wide uppercase text-on-surface-variant">
                {t('generate.selectChannel')}
              </p>
              <p className="text-sm font-medium text-on-surface-variant mt-1">
                {t('generate.channelSelectionHint')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => toggleOnlineChannel('app')}
                className={`h-11 px-4 rounded-xl font-bold inline-flex items-center gap-2 transition-colors ${
                  enabledChannels.app
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">smartphone</span>
                {t('generate.channelApp')}
              </button>

              <button
                type="button"
                onClick={() => toggleOnlineChannel('line')}
                className={`h-11 px-4 rounded-xl font-bold inline-flex items-center gap-2 transition-colors ${
                  enabledChannels.line
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                {t('generate.channelLine')}
              </button>
            </div>
          </section>
        )}

        {actionError && (
          <section className="rounded-2xl bg-error-container p-4 text-sm font-medium text-on-error-container">
            {actionError}
          </section>
        )}

        <section className="space-y-4">
          <button
            onClick={handleGenerateBills}
            disabled={isGenerating || selectedRooms.length === 0}
            className={`w-full h-16 btn-primary-gradient text-on-primary rounded-2xl font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-3 ${
              isGenerating || selectedRooms.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'active:scale-95'
            }`}
          >
            <span>
              {isGenerating
                ? activeTab === 'online'
                  ? t('generate.sendingOnline')
                  : t('generate.preparingPdf')
                : activeTab === 'online'
                  ? t('generate.sendOnlineCta')
                  : t('generate.printPdfCta')}
            </span>
          </button>
          <p className="text-center text-on-surface-variant text-sm px-4 leading-relaxed">
            {modeHint}
          </p>
          {generationFeedback && (
            <p className="text-center text-sm font-medium text-secondary">
              {generationFeedback}
            </p>
          )}
        </section>

        <div className="flex justify-between items-center px-2">
          <h3 className="text-lg font-bold text-on-surface">{t('generate.selectRooms')}</h3>
          <button
            onClick={toggleAll}
            disabled={isGenerating || activeRooms.length === 0}
            className={`text-primary font-bold text-sm transition-opacity ${
              isGenerating || activeRooms.length === 0
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:opacity-80'
            }`}
          >
            {isSelectAll
              ? t('generate.deselectAll')
              : t('generate.selectAll', { count: activeRooms.length })}
          </button>
        </div>

        {activeRooms.length === 0 ? (
          <div className="rounded-3xl bg-surface-container-low p-6 text-center text-on-surface-variant font-medium">
            {modeEmptyState}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRooms.map((room) => {
              const selected = activeSelectedIds.has(room.id);
              const roomAdditionalCharge = getRoomAdditionalCharge(
                room.number,
                additionalChargeContext
              );

              return (
                <div
                  key={room.id}
                  onClick={() => !isGenerating && toggleRoom(room.id)}
                  className={`bg-surface-container-lowest rounded-3xl p-5 flex items-center gap-5 transition-all ${
                    isGenerating
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:bg-surface-container-low cursor-pointer'
                  }`}
                >
                  <div className="shrink-0">
                    <div
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        selected
                          ? 'border-primary bg-primary'
                          : 'border-outline-variant bg-transparent'
                      }`}
                    >
                      {selected && (
                        <span className="material-symbols-outlined text-on-primary text-xl font-bold">
                          check
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grow">
                    <h4 className="text-lg font-bold text-on-surface">
                      {t('common.room')} {room.number}
                    </h4>
                    <p className="text-on-surface-variant text-sm font-medium">
                      {room.tenantName ?? t('roomCard.vacant')}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mt-2">
                      {activeTab === 'online'
                        ? t('generate.connectionOnline')
                        : t('generate.connectionPhysical')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-on-surface">
                      {formatCurrency(room.baseRent + roomAdditionalCharge)}
                    </p>
                    {roomAdditionalCharge > 0 && (
                      <p className="text-[10px] font-medium text-on-surface-variant">
                        {t('generate.basePlusExtra', {
                          base: formatCurrency(room.baseRent),
                          extra: formatCurrency(roomAdditionalCharge),
                        })}
                      </p>
                    )}
                    <span className="inline-block px-2 py-0.5 rounded-sm bg-surface-container text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter mt-1">
                      {t('generate.meterDate')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
