'use client';

/**
 * Buyer Payment Page — /order/buyer/[id]/payment
 *
 * Shown after buyer taps "Terima Pesanan". Guides buyer through QRIS payment.
 *
 * NOTE [BACKEND / TRACKING]:
 *   - "Close Order" unlocks when driver confirms payment (status → COMPLETED).
 *   - In production: buyer polls GET /orders/:id; unlock when status === 'COMPLETED'.
 *   - Frontend simulation: reads `paymentConfirmedOrderId` from Zustand store,
 *     which is set by driver's handlePaymentReceived().
 *   - Replace Zustand check with real status polling once backend is ready.
 *
 * NOTE [BACKEND / STATUS]:
 *   - "Close Order" click: PATCH /orders/:id/status → COMPLETED (or just
 *     acknowledge receipt — exact flow TBD with backend team).
 */

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Download, Loader2, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import BottomNav from '@/components/ui/BottomNav';
import { PaymentStepsCard } from '@/components/order-buyer';
import { useOrderPolling } from '@/hooks/useOrderPolling';
import RatingModal from '@/components/modal/RatingModal';

export default function BuyerPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = parseInt(id, 10);
  const router  = useRouter();
  const [showRating, setShowRating] = useState(false);

  const { data: order, isLoading } = useOrderPolling(
    isNaN(orderId) ? null : orderId
  );

  const isPaymentConfirmed = order?.status === 'COMPLETED';

  const handleCloseOrder = () => {
    setShowRating(true);
  };

  const handleFinish = () => {
    setShowRating(false);
    router.push('/');
  };

  if (isLoading || !order) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-bold font-bitter text-[#1B1B24] hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <h1 className="text-2xl font-bold font-bitter text-[#1B1B24] mt-2 mb-6">
          Langkah Pembayaran
        </h1>

        {/* QRIS Card */}
        <div className="border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-4 mb-6 shadow-sm bg-white">
          <p className="text-sm font-bold text-gray-500 font-bitter uppercase tracking-wider">QRIS Driver</p>
          <div className="w-[280px] h-[280px] rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
            {order.driver?.driverProfile?.qrisUrl && !order.driver.driverProfile.qrisUrl.startsWith('/dummy') ? (
              <img
                src={order.driver.driverProfile.qrisUrl}
                alt="QRIS Driver"
                className="object-contain w-full h-full p-2"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <QrCode className="w-16 h-16 stroke-1" />
                <p className="text-xs text-center max-w-[200px] leading-relaxed">
                  QRIS tidak tersedia. Silakan lakukan pembayaran tunai atau tanyakan driver.
                </p>
              </div>
            )}
          </div>

          {order.driver?.driverProfile?.qrisUrl && !order.driver.driverProfile.qrisUrl.startsWith('/dummy') && (
            <a
              href={order.driver.driverProfile.qrisUrl}
              download={`qris-${order.driver?.name ?? 'driver'}.png`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <Download className="w-4 h-4" />
              Download QRIS
            </a>
          )}

          <div className="text-center">
            <p className="text-base font-bold font-bitter text-[#1B1B24]">
              {order.driver?.name || 'Nama Driver'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {order.driver?.phoneNumber ? `WA: ${order.driver.phoneNumber}` : ''}
            </p>
          </div>
        </div>

        <PaymentStepsCard />
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-gray-100 mx-0" />

      {/* ── Bottom button ── */}
      <div className="px-5 pb-4 pt-4">
        {isPaymentConfirmed ? (
          <button
            type="button"
            onClick={handleCloseOrder}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-bitter font-semibold text-base"
          >
            Close Order
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              disabled
              className="w-full rounded-2xl py-4 border border-gray-200 text-primary font-bitter font-semibold text-base cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Menunggu Konfirmasi Driver...
            </button>
          </div>
        )}
      </div>

      <BottomNav />

      {showRating && (
        <RatingModal
          orderId={order.id}
          driverName={order.driver?.name || 'Driver'}
          onClose={handleFinish}
          onSuccess={handleFinish}
        />
      )}
    </>
  );
}

