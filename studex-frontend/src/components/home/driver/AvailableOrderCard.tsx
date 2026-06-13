'use client';

import { Truck } from 'lucide-react';
import type { AvailableOrder } from '@/dummy_payload/driver_home';

interface AvailableOrderCardProps {
  order: AvailableOrder;
  isFocused: boolean;
  onClick: () => void;
  onAccept: (id: number) => void;
}

export default function AvailableOrderCard({
  order,
  isFocused,
  onClick,
  onAccept,
}: AvailableOrderCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border overflow-hidden cursor-pointer transition-colors ${
        isFocused ? 'border-gray-200' : 'border-gray-200'
      }`}
    >
      {/* Left accent line when focused */}
      {isFocused && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />
      )}

      <div className="p-4 pl-5 space-y-3">
        {/* Title */}
        <h3 className="text-base font-bold font-bitter text-[#1B1B24] leading-snug">
          {order.title}
        </h3>

        {/* Route points */}
        <div className="space-y-2">
          {/* Pickup */}
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-400 shrink-0" />
            <div>
              <p className="text-xs font-bold font-bitter text-[#1B1B24]">Titik Tujuan</p>
              <p className="text-sm text-gray-600">{order.pickupPoint}</p>
            </div>
          </div>

          {/* Delivery */}
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 w-3.5 h-3.5 rounded-full bg-primary shrink-0" />
            <div>
              <p className="text-xs font-bold font-bitter text-[#1B1B24]">Titik Antar</p>
              <p className="text-sm text-gray-600">{order.deliveryPoint}</p>
            </div>
          </div>
        </div>

        {/* Accept button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAccept(order.id);
          }}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bitter font-semibold text-sm transition-colors ${
            isFocused
              ? 'bg-primary text-white'
              : 'border border-primary/30 text-primary bg-transparent'
          }`}
        >
          <Truck className="w-4 h-4" />
          Ambil Orderan
        </button>
      </div>
    </div>
  );
}
