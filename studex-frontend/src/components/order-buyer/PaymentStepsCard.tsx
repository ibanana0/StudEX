'use client';

import { Info } from 'lucide-react';

const STEPS = [
  {
    num: 1,
    title: 'Buka E-Wallet',
    desc: 'Buka aplikasi E-Wallet favoritmu (GoPay, OVO, Dana, LinkAja) atau aplikasi M-Banking.',
  },
  {
    num: 2,
    title: 'Scan QR Code',
    desc: "Pilih menu 'Scan' atau 'Bayar' di aplikasi, lalu arahkan kamera ke kode QR di atas.",
  },
  {
    num: 3,
    title: 'Selesaikan Pembayaran',
    desc: 'Masukkan jumlah nominal yang sesuai, konfirmasi pembayaran, dan masukkan PIN keamanan Anda.',
  },
] as const;

export default function PaymentStepsCard() {
  return (
    <div className="space-y-6">
      {/* Numbered steps */}
      <div className="space-y-0">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex gap-4">
            {/* Left: circle + vertical connector */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-white font-bold font-bitter text-sm">{step.num}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-0.5 flex-1 bg-primary/20 my-1" style={{ minHeight: 24 }} />
              )}
            </div>

            {/* Right: text */}
            <div className="pb-6 pt-1.5 flex-1">
              <p className="text-base font-bold font-bitter text-[#1B1B24] leading-tight">
                {step.title}
              </p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Warning box */}
      <div className="flex items-start gap-3 border border-amber-300 bg-amber-50 rounded-2xl px-4 py-4">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm font-semibold font-bitter text-amber-600 leading-relaxed">
          Pastikan nominal yang Anda masukkan sudah sesuai dengan total tagihan
        </p>
      </div>
    </div>
  );
}
