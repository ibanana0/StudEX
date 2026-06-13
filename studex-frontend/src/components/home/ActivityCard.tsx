'use client';

import { Check } from 'lucide-react';

export type ActivityStatus = 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS' | 'SEARCHING';

// Note: Masih kurang tahu apakah di sini perlu menampilkan order yang 'in progress' dan 'searching' apa tidak

interface ActivityCardProps {
  title: string;
  status: string;       
  time: string;         
  iconVariant?: 'check' | 'clock' | 'x';
  onClick?: () => void;
}

const iconConfig = {
  check: { bg: 'bg-primary/10', color: 'text-primary', Icon: Check },
  clock: { bg: 'bg-amber-50',   color: 'text-amber-500',  Icon: Check },
  x:     { bg: 'bg-red-50',     color: 'text-red-400',    Icon: Check },
};

export default function ActivityCard({
  title,
  status,
  time,
  iconVariant = 'check',
  onClick,
}: ActivityCardProps) {
  const { bg, color, Icon } = iconConfig[iconVariant];

  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer flex items-center gap-3 p-3 rounded-xl border border-[#F0F0F5] bg-white hover:bg-gray-50/60 transition-colors text-left"
    >
      {/* Status Icon */}
      <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} strokeWidth={3} />
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
