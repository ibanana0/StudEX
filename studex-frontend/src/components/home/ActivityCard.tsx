'use client';

import { ShoppingBag } from 'lucide-react';

export type ActivityStatus = 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS' | 'SEARCHING';

interface ActivityCardProps {
  title: string;
  status: string;
  time: string;
  iconVariant?: 'check' | 'clock' | 'x';
  onClick?: () => void;
}

export default function ActivityCard({
  title,
  status,
  time,
  onClick,
}: ActivityCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer flex items-center gap-3 p-3 rounded-xl border border-[#F0F0F5] bg-white hover:bg-gray-50/60 transition-colors text-left"
    >
      {/* Status Icon */}
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
        <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#1A1A2E] truncate">{title}</h3>
        <p className="text-xs text-[#8E8E9A] mt-0.5">
          {status} <span className="mx-0.5">•</span> {time}
        </p>
      </div>
    </button>
  );
}
