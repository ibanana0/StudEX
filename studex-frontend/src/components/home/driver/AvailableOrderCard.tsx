'use client';

import { useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';
import type { AvailableOrder } from '@/dummy_payload/driver_home';

interface AvailableOrderCardProps {
  order: AvailableOrder;
  isFocused: boolean;
  isAccepted: boolean;
  /** True when driver already has another active order — button disabled */
  isLocked: boolean;
  onClick: () => void;
}

export default function AvailableOrderCard({
  order,
  isFocused,
  isAccepted,
  isLocked,
  onClick,
}: AvailableOrderCardProps) {
  const router = useRouter();

  // Accepted: amber palette. Focused (not accepted): primary blue. Locked: gray.
  const accentColor  = isAccepted ? 'bg-amber-400' : 'bg-primary';
  const buttonActive = isAccepted ? 'bg-amber-400 text-white' : 'bg-primary text-white';
  const buttonIdle   = 'border border-primary/30 text-primary bg-transparent';
  const buttonLocked = 'bg-gray-100 text-gray-400 cursor-not-allowed';
  const showAccent   = isAccepted || isFocused;
  const buttonClass  = isLocked ? buttonLocked : showAccent ? buttonActive : buttonIdle;
  const buttonLabel  = isAccepted ? 'Pesanan sedang diproses' : 'Ambil Orderan';

  return (
    <div
      onClick={onClick}
      className="relative rounded-2xl border border-gray-200 overflow-hidden cursor-pointer"
    >
      {/* Left accent line */}
      {showAccent && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accentColor}`} />
      )}

      <div className="p-4 pl-5 space-y-3">
        {/* Title */}
        <h3 className="text-base font-bold font-bitter text-[#1B1B24] leading-snug">
          {order.title}
        </h3>

        {/* Route points */}
        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-400 shrink-0" />
            <div>
              <p className="text-xs font-bold font-bitter text-[#1B1B24]">Titik Tujuan</p>
              <p className="text-sm text-gray-600">{order.pickupPoint}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 w-3.5 h-3.5 rounded-full bg-primary shrink-0" />
            <div>
              <p className="text-xs font-bold font-bitter text-[#1B1B24]">Titik Antar</p>
              <p className="text-sm text-gray-600">{order.deliveryPoint}</p>
            </div>
          </div>
        </div>

        {/* Action button
            TODO [BACKEND]: enforce single-active-order at API level —
            POST /orders/:id/accept should return 409 if driver already has
            an order with status DIPROSES_DRIVER or DALAM_PERJALANAN.
            DB: add unique partial index on driver_id where status IN (active statuses). */}
        <button
          type="button"
          disabled={isLocked}
          onClick={(e) => {
            e.stopPropagation();
            if (!isLocked) router.push(`/order/driver/${order.id}`);
          }}
          className={`w-full flex items-center cursor-pointer justify-center gap-2 rounded-xl py-3.5 font-bitter font-semibold text-sm transition-colors ${isLocked ? buttonLocked : 'hover:opacity-90'} ${buttonClass}`}
        >
          <Truck className="w-4 h-4" />
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
