'use client';

import { Truck } from 'lucide-react';

interface AcceptedStatusCardProps {
  subtitle: string;
}

export default function AcceptedStatusCard({ subtitle }: AcceptedStatusCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border-l-4 border-amber-400 px-4 py-4">
      <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
        <Truck className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-bold font-bitter text-[#1B1B24] leading-tight">
          Anda mengambil order ini
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
