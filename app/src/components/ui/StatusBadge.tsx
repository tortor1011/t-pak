import { BillingStatus } from '@/types/room';

const STATUS_STYLES: Record<BillingStatus, { bg: string; text: string; label: string }> = {
  paid:    { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'PAID' },
  pending: { bg: 'bg-error-container', text: 'text-on-error-container', label: 'PENDING' },
  unpaid:  { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed-variant', label: 'UNPAID' },
};

interface StatusBadgeProps {
  status: BillingStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`${style.bg} ${style.text} text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${className}`}
    >
      {style.label}
    </span>
  );
}
