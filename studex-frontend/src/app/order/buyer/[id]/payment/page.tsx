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

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import BottomNav from '@/components/ui/BottomNav';
import { PaymentStepsCard } from '@/components/order-buyer';
import { useUserStore } from '@/stores/userStore';

export default function BuyerPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = parseInt(id, 10);
  const router  = useRouter();

  // Unlocked when driver calls handlePaymentReceived() on their side.
  // TODO [BACKEND]: replace with order.status === 'COMPLETED' from polling.
  const paymentConfirmedOrderId = useUserStore((s) => s.paymentConfirmedOrderId);
  const setPaymentConfirmedOrderId = useUserStore((s) => s.setPaymentConfirmedOrderId);
  const isPaymentConfirmed = paymentConfirmedOrderId === orderId;

  const handleCloseOrder = () => {
    setPaymentConfirmedOrderId(null);
    toast.success('Order selesai! Terima kasih telah menggunakan StudEx.');
    // TODO [API]: PATCH /orders/:id/status → COMPLETED (buyer acknowledgement)
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
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
          <button
            type="button"
            disabled
            className="w-full rounded-2xl py-4 border border-gray-200 text-primary font-bitter font-semibold text-base cursor-not-allowed opacity-60"
          >
            Close Order
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
