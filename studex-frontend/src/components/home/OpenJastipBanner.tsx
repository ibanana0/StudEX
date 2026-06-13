'use client';

import { ShoppingCart, Plus } from 'lucide-react';

interface OpenJastipBannerProps {
  onStartOrder?: () => void;
}

export default function OpenJastipBanner({ onStartOrder }: OpenJastipBannerProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/70 p-8 shadow-lg">
      {/* Decorative subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/20" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/10" />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top: Icon + Title */}
        <div className="flex items-center gap-3">
          {/* Shopping cart icon in light purple square */}
          <div className="w-11 h-11 rounded-xl bg-[#C4B5FD]/40 flex items-center justify-center shrink-0">
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-white" strokeWidth={2} />
              <Plus className="w-3 h-3 text-white absolute -top-1 -right-1.5" strokeWidth={3} />
            </div>
          </div>
          <div>
            <h2 className="text-white font-bold text-4xl leading-tight">
              Open Jastip
            </h2>
          </div>
        </div>

        <div>
          <p className="text-white/85 text-md mt-1 leading-snug">
            Minta tolong teman belikan barang di sekitar kampus.
          </p>
        </div>
        
        {/* CTA Button */}
        <button
          onClick={onStartOrder}
          className="w-full bg-white text-primary font-semibold text-sm py-4 rounded-full shadow-sm hover:bg-white/95 active:translate-y-px transition-all font-bitter cursor-pointer"
        >
          Mulai Pesanan
        </button>
      </div>
    </div>
  );
}
