'use client';

import { Truck, ChevronRight } from 'lucide-react';
import type { ActiveOrderSummary } from '@/dummy_payload/home';

interface ActiveOrderBannerProps {
  order: ActiveOrderSummary;
  onClick: () => void;
}

export default function ActiveOrderBanner({ order, onClick }: ActiveOrderBannerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-amber-50 border-l-4 border-amber-400 rounded-2xl px-4 py-3.5 text-left hover:bg-amber-100 transition-colors"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
        <Truck className="w-5 h-5 text-white" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold font-bitter text-[#1B1B24] leading-tight">
          Pesanan Sedang Diproses
        </p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {order.shopName}
          {order.estimatedMinutes > 0 && (
            <span> • {order.estimatedMinutes} mnt lagi</span>
          )}
        </p>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
    </button>
  );
}
