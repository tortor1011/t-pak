'use client';

import { Room } from '@/types/room';
import Image from 'next/image';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '@/utils/currency';
import { useLanguage } from '@/hooks/useLanguage';

interface RoomCardProps {
  room: Room;
  onClick?: () => void;
  actionButton?: React.ReactNode;
}

export default function RoomCard({ room, onClick, actionButton }: RoomCardProps) {
  const { t } = useLanguage();

  return (
    <div
      className="bg-surface-container-lowest p-5 rounded-2xl flex justify-between items-center shadow-[0_10px_40px_rgba(18,28,40,0.03)] cursor-pointer hover:bg-surface-container-low transition-colors"
      onClick={onClick}
    >
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-on-surface">{room.number}</span>
          <StatusBadge status={room.billingStatus} />
        </div>
        <p className="text-on-surface-variant font-medium">
          {room.tenantName ?? t('roomCard.vacant')}
        </p>
        {room.currentBill > 0 && (
          <p className="text-lg font-bold text-on-surface">
            {formatCurrency(room.currentBill)}
          </p>
        )}
      </div>
      {actionButton ? (
        <div onClick={(e) => e.stopPropagation()}>{actionButton}</div>
      ) : (
        <div className="h-12 w-12 rounded-full bg-surface-container overflow-hidden flex items-center justify-center">
          {room.tenantAvatar ? (
            <Image
              className="w-full h-full object-cover"
              src={room.tenantAvatar}
              alt={room.tenantName ?? ''}
              width={48}
              height={48}
            />
          ) : (
            <span className="material-symbols-outlined text-outline">person</span>
          )}
        </div>
      )}
    </div>
  );
}
