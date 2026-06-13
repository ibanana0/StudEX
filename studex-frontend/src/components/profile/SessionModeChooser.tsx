'use client';

import { Bike, ShoppingBag } from 'lucide-react';
import type { SessionMode } from '@/types';

interface SessionModeChooserProps {
  title?: string;
  description?: string;
  onSelect: (mode: SessionMode) => void;
}

const modeOptions = [
  {
    mode: 'BUYER' as const,
    title: 'Pembeli',
    description: 'Buat dan lacak pesanan jastip kampusmu.',
    icon: ShoppingBag,
  },
  {
    mode: 'DRIVER' as const,
    title: 'Driver',
    description: 'Terima order dan antar pesanan StudEx.',
    icon: Bike,
  },
];

export default function SessionModeChooser({
  title = 'Masuk sebagai',
  description = 'Pilih mode sesi yang ingin kamu gunakan untuk login kali ini.',
  onSelect,
}: SessionModeChooserProps) {
  return (
    <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-xl">
      <h2 className="font-bitter text-2xl text-[#1B1B24]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#5F5A74]">{description}</p>

      <div className="mt-5 space-y-3">
        {modeOptions.map(({ mode, title: optionTitle, description: optionDescription, icon: Icon }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onSelect(mode)}
            className="flex w-full items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-left transition-colors hover:bg-primary/10"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bitter text-base font-semibold text-[#1B1B24]">{optionTitle}</p>
              <p className="text-sm text-[#5F5A74]">{optionDescription}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
