'use client';

import { BillingStatus } from '@/types/room';
import { useLanguage } from '@/hooks/useLanguage';
import type { TranslationKey } from '@/services/i18n';

const STATUS_STYLES: Record<string, { bg: string; text: string; labelKey: TranslationKey }> = {
  paid: { bg: 'bg-secondary-container', text: 'text-on-secondary-container', labelKey: 'status.paid' },
  pending: { bg: 'bg-error-container', text: 'text-on-error-container', labelKey: 'status.pending' },
  unpaid: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed-variant', labelKey: 'status.unpaid' },
};

interface StatusBadgeProps {
  status: BillingStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { t } = useLanguage();
  const style = STATUS_STYLES[status];

  return (
    <span
      className={`${style.bg} ${style.text} text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${className}`}
    >
      {t(style.labelKey)}
    </span>
  );
}
