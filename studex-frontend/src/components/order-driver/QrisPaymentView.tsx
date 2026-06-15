'use client';

import Image from 'next/image';
import { Info, QrCode } from 'lucide-react';

interface QrisPaymentViewProps {
  driverName: string;
  driverId: number;
  /** URL of the driver's QRIS image from their driver profile */
  qrisUrl: string;
}

function formatDriverId(id: number): string {
  return `STDX-DRIVER-${String(id).padStart(4, '0')}`;
}

export default function QrisPaymentView({ driverName, driverId, qrisUrl }: QrisPaymentViewProps) {
  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-primary/10 rounded-2xl px-4 py-4">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="text-sm text-primary font-medium leading-relaxed">
          Tunjukkan QR Code ini kepada pembeli untuk menerima pembayaran jastip.
        </p>
      </div>

      {/* QRIS card */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden p-4 flex flex-col items-center gap-4">
        {/* QRIS image — fixed square frame, object-contain */}
        <div className="w-[280px] h-[280px] rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
          {qrisUrl && !qrisUrl.startsWith('/dummy') ? (
            <Image
              src={qrisUrl}
              alt="QRIS Driver"
              width={280}
              height={280}
              unoptimized
              className="object-contain w-full h-full p-2"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <QrCode className="w-24 h-24" strokeWidth={1} />
              <p className="text-xs text-center max-w-[160px] leading-relaxed">
                QRIS driver akan ditampilkan di sini
              </p>
            </div>
          )}
        </div>

        {/* Driver identity */}
        <div className="text-center">
          <p className="text-lg font-bold font-bitter text-[#1B1B24]">{driverName}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{formatDriverId(driverId)}</p>
        </div>
      </div>
    </div>
  );
}
