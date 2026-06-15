'use client';

import { Loader2, Truck, ChevronRight } from 'lucide-react';

export interface ActiveOrderBannerData {
  id: number;
  shopName: string;
  /** Optional minutes remaining; if undefined, hidden. */
  estimatedMinutes?: number;
}

interface ActiveOrderBannerProps {
  order: ActiveOrderBannerData;
  onClick: () => void;
  variant?: 'buyer' | 'driver' | 'searching';
  label?: string;
}

export default function ActiveOrderBanner({
  order,
  onClick,
  variant = 'buyer',
  label,
}: ActiveOrderBannerProps) {
  const isDriver = variant === 'driver';
  const isSearching = variant === 'searching';

  const wrapClass = isDriver
    ? 'bg-orange-50 border-l-4 border-orange-400 hover:bg-orange-100'
    : isSearching
    ? 'bg-blue-50 border-l-4 border-blue-400 hover:bg-blue-100'
    : 'bg-amber-50 border-l-4 border-amber-400 hover:bg-amber-100';

  const iconBg = isDriver ? 'bg-orange-400' : isSearching ? 'bg-blue-400' : 'bg-amber-400';

  const heading = label ?? (isDriver ? 'Order Sedang Diproses' : 'Pesanan Sedang Diproses');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors ${wrapClass}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        {isSearching
          ? <Loader2 className="w-5 h-5 text-white animate-spin" />
          : <Truck className="w-5 h-5 text-white" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold font-bitter text-[#1B1B24] leading-tight">
          {heading}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {order.shopName}
          {typeof order.estimatedMinutes === 'number' && order.estimatedMinutes > 0 && (
            <span> • {order.estimatedMinutes} mnt lagi</span>
          )}
        </p>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
    </button>
  );
}
