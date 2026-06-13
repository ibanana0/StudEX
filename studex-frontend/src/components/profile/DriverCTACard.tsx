'use client';

import { ArrowRight, Bike } from 'lucide-react';

interface DriverCTACardProps {
  onClick: () => void;
  title?: string;
  description?: string;
  disabled?: boolean;
}

export default function DriverCTACard({
  onClick,
  title = 'Daftar Jadi Driver StudEx',
  description = 'Bantu teman kampusmu & dapatkan penghasilan tambahan.',
  disabled = false,
}: DriverCTACardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-4 rounded-2xl bg-primary p-4 text-left hover:opacity-95 transition-opacity disabled:cursor-default disabled:opacity-85"
    >
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <Bike className="w-5 h-5 text-white" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white font-bitter leading-tight">
          {title}
        </p>
        <p className="text-xs text-white/70 mt-0.5 leading-snug">
          {description}
        </p>
      </div>

      {/* Arrow */}
      {!disabled ? <ArrowRight className="w-5 h-5 text-white/80 shrink-0" /> : null}
    </button>
  );
}
