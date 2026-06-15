'use client';

import { useState } from 'react';
import { Clock, MessageSquare, Star } from 'lucide-react';
import { User } from 'lucide-react';
import type { OrderStatus } from '@/types/order';
import type { BuyerOrderDriver } from '@/dummy_payload/buyer_order';
import ChatSheet from '@/components/shared/ChatSheet';

interface OrderInfoCardProps {
  orderCode: string;
  shopName: string;
  estimatedTime: string;
  status: OrderStatus;
  driver?: BuyerOrderDriver | null;
}

const STATUS_BADGE: Partial<Record<OrderStatus, { label: string; className: string }>> = {
  MENCARI_DRIVER:   { label: 'Mencari Driver',    className: 'bg-yellow-100 text-yellow-700' },
  DIPROSES_DRIVER:  { label: 'Diproses',           className: 'bg-primary/10 text-primary' },
  DALAM_PERJALANAN: { label: 'Dalam Perjalanan',   className: 'bg-amber-100 text-amber-700' },
  DRIVER_SAMPAI:    { label: 'Sampai',             className: 'bg-green-500 text-white' },
  PESANAN_TIBA:     { label: 'Pesanan Tiba',       className: 'bg-green-500 text-white' },
  COMPLETED:        { label: 'Selesai',            className: 'bg-gray-100 text-gray-600' },
};

export default function OrderInfoCard({
  orderCode,
  shopName,
  estimatedTime,
  status,
  driver,
}: OrderInfoCardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const badge = STATUS_BADGE[status];

  return (
    <>
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        {/* ETA + status row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#1B1B24]">
            <Clock className="w-4 h-4 text-primary" />
            Estimasi Tiba: {estimatedTime}
          </div>
          {badge && (
            <span className={`text-xs font-semibold font-bitter px-3 py-1 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </div>

        {/* Order identity */}
        <div className="px-4 pt-3 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold font-bitter text-[#1B1B24] leading-snug">{shopName}</h2>
          <p className="text-sm text-gray-500 mt-0.5">ID Pesanan: #{orderCode}</p>
        </div>

        {/* Driver row */}
        {driver ? (
          <div className="flex items-center gap-3 px-4 py-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
                {driver.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={driver.avatarUrl} alt={driver.name} className="object-cover w-full h-full" />
                ) : (
                  <User className="w-6 h-6 text-primary/60" strokeWidth={1.5} />
                )}
              </div>
              {/* Star badge */}
              <div className="absolute -bottom-0.5 -left-0.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                <Star className="w-2.5 h-2.5 fill-white text-white" />
              </div>
            </div>

            {/* Driver info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold font-bitter text-[#1B1B24]">{driver.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-500">{driver.faculty}</span>
                <span className="text-gray-300">•</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-[#1B1B24]">{driver.rating}</span>
              </div>
            </div>

            {/* Chat button */}
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-primary" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-4 bg-gray-50/50 text-gray-500 text-sm">
            <User className="w-5 h-5 text-gray-400" />
            <span>Menunggu driver mengambil pesanan...</span>
          </div>
        )}
      </div>

      {driver && (
        <ChatSheet
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          targetName={driver.name}
          targetRole="driver"
          phoneNumber={driver.phone}
        />
      )}
    </>
  );
}
