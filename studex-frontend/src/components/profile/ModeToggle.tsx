'use client';

import { ShoppingBag, Bike } from 'lucide-react';
import type { Role } from '@/types/user';

interface ModeToggleProps {
  currentRole: Role;
  onToggle: (targetRole: Role) => void;
}

export default function ModeToggle({ currentRole, onToggle }: ModeToggleProps) {
  const isBuyer = currentRole !== 'DRIVER';

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold font-bitter text-[#1B1B24]">Mode saat ini</label>

      <div className="flex bg-gray-200 rounded-2xl p-1 gap-1">
        {/* Pembeli */}
        <button
          type="button"
          onClick={() => onToggle('USER')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 transition-colors font-bitter font-medium text-sm ${
            isBuyer
              ? 'bg-[#F5F2FF] text-primary'
              : 'bg-transparent text-gray-400'
          }`}
        >
          <ShoppingBag className="w-[18px] h-[18px]" />
          Pembeli
        </button>

        {/* Driver */}
        <button
          type="button"
          onClick={() => onToggle('DRIVER')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 transition-colors font-bitter font-medium text-sm ${
            !isBuyer
              ? 'bg-[#F5F2FF] text-primary'
              : 'bg-transparent text-gray-400'
          }`}
        >
          <Bike className="w-[18px] h-[18px]" />
          Driver
        </button>
      </div>
    </div>
  );
}
