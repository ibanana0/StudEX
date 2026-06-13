'use client';

import { Truck } from 'lucide-react';

interface ConfirmAcceptModalProps {
  orderTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmAcceptModal({
  orderTitle,
  onConfirm,
  onCancel,
}: ConfirmAcceptModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-5" />

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Truck className="w-7 h-7 text-primary" />
        </div>

        {/* Title */}
        <h3 className="text-center text-lg font-bold font-bitter text-[#1B1B24] mb-2">
          Ambil Pesanan Ini?
        </h3>

        {/* Description */}
        <p className="text-center text-sm text-muted-foreground mb-1 leading-relaxed">
          Anda akan mengambil pesanan
        </p>
        <p className="text-center text-sm font-semibold font-bitter text-[#1B1B24] mb-5 leading-relaxed">
          &ldquo;{orderTitle}&rdquo;
        </p>
        <p className="text-center text-sm text-muted-foreground mb-6 leading-relaxed">
          Pastikan Anda siap menuju titik tujuan dan mengantarkan pesanan hingga selesai.
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full bg-primary text-white rounded-2xl py-4 font-bold font-bitter text-base hover:opacity-90 transition-opacity"
          >
            Ya, Ambil Pesanan
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-100 text-[#1B1B24] rounded-2xl py-4 font-semibold font-bitter text-base hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
