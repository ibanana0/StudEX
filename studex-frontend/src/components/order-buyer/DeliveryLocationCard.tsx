'use client';

import { MapPin } from 'lucide-react';

interface DeliveryLocationCardProps {
  address: string;
}

export default function DeliveryLocationCard({ address }: DeliveryLocationCardProps) {
  return (
    <div>
      <p className="text-sm font-bold font-bitter text-[#1B1B24] mb-2">Diantar ke</p>
      <div className="border border-gray-200 rounded-2xl flex items-start gap-3 px-4 py-4">
        <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-gray-600 leading-relaxed">{address}</p>
      </div>
    </div>
  );
}
