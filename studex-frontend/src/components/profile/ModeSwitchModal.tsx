'use client';

import { ShoppingBag, Bike } from 'lucide-react';
import type { Role } from '@/types/user';

interface ModeSwitchModalProps {
  targetRole: Role;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ModeSwitchModal({
  targetRole,
  onConfirm,
  onCancel,
}: ModeSwitchModalProps) {
  const isSwitchingToDriver = targetRole === 'DRIVER';

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onCancel}
    >
      {/* Sheet */}
      <div
        className="w-[430px] bg-white rounded-t-3xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close handle */}
        <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-5" />

        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          isSwitchingToDriver ? 'bg-primary/10' : 'bg-muted'
        }`}>
          {isSwitchingToDriver ? (
            <Bike className="w-7 h-7 text-primary" />
          ) : (
            <ShoppingBag className="w-7 h-7 text-foreground" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-center text-lg font-semibold font-bitter text-[#1B1B24] mb-2">
          {isSwitchingToDriver
            ? 'Beralih ke Mode Driver?'
            : 'Beralih ke Mode Pembeli?'}
        </h3>

        {/* Description */}
        <p className="text-center text-sm text-muted-foreground mb-6 leading-relaxed">
          {isSwitchingToDriver
            ? 'Anda akan menerima pesanan jastip dari pembeli lain. Pastikan data driver Anda sudah lengkap dan terverifikasi.'
            : 'Anda akan kembali sebagai pembeli. Pesanan jastip yang sedang Anda kerjakan sebagai driver tidak akan terpengaruh.'}
        </p>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold font-bitter hover:opacity-90 transition-opacity"
          >
            Ya, Ganti Mode
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-muted text-foreground rounded-xl py-3 font-semibold font-bitter hover:bg-muted/80 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
