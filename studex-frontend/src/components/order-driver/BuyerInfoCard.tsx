'use client';

import { useState } from 'react';
import { MapPin, Map, MessageSquare } from 'lucide-react';
import ChatSheet from '@/components/shared/ChatSheet';

interface BuyerInfoCardProps {
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
}

export default function BuyerInfoCard({
  buyerName,
  buyerPhone,
  deliveryAddress,
  deliveryLat,
  deliveryLng,
}: BuyerInfoCardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const initial = buyerName.charAt(0).toUpperCase();
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${deliveryLat},${deliveryLng}`;

  return (
    <>
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        {/* Buyer row */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-bitter mb-0.5">Pemesan</p>
            <p className="text-base font-bold font-bitter text-[#1B1B24] leading-tight">
              {buyerName}
            </p>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-base leading-none">{initial}</span>
          </div>

          {/* Chat button — opens ChatSheet */}
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Delivery address */}
        <div className="flex items-start gap-3 px-4 py-4 border-b border-gray-100">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold font-bitter text-[#1B1B24]">Titik Pengantaran</p>
            <p className="text-sm text-gray-600 mt-0.5">{deliveryAddress}</p>
          </div>
        </div>

        {/* Google Maps button */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold font-bitter text-primary hover:bg-primary/5 transition-colors"
        >
          <Map className="w-4 h-4" />
          Buka Rute di Google Maps
        </a>
      </div>

      {/* Chat bottom sheet */}
      <ChatSheet
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetName={buyerName}
        targetRole="buyer"
        phoneNumber={buyerPhone}
      />
    </>
  );
}
