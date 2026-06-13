'use client';

/**
 * Buyer Order Tracking Page — /order/buyer/[id]
 *
 * NOTE [BACKEND / ARCHITECTURE]: Progress tracking logic belongs in the backend.
 *   - Driver calls PATCH /orders/:id/status at each wizard step.
 *   - This page should poll GET /orders/:id every ~5s (use the existing
 *     useOrderPolling hook) or subscribe to an SSE stream for push updates.
 *   - The `deriveProgressSteps()` utility reads only `order.status` —
 *     the existing OrderStatus enum covers all steps, no new DB fields needed.
 *
 * For now: reads from DUMMY_BUYER_ORDER (static). Replace with real API call
 * once the backend status-update endpoints are wired up.
 */

import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import BottomNav from '@/components/ui/BottomNav';
import {
  OrderInfoCard,
  DeliveryLocationCard,
  OrderProgressTimeline,
  deriveProgressSteps,
} from '@/components/order-buyer';
import { DUMMY_BUYER_ORDER } from '@/dummy_payload/buyer_order';

export default function BuyerOrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = parseInt(id, 10);
  const router = useRouter();

  // TODO [API]: replace with useOrderPolling(orderId) for live updates
  const order = DUMMY_BUYER_ORDER.id === orderId ? DUMMY_BUYER_ORDER : null;

  const steps = useMemo(() => {
    if (!order) return [];
    return deriveProgressSteps(
      order.status,
      order.stepTimestamps,
      order.deliveryAddress,
    );
  }, [order]);

  const isArrived = order?.status === 'DRIVER_SAMPAI' || order?.status === 'PESANAN_TIBA';

  const handleReceive = () => {
    // TODO [API]: PATCH /orders/:id/status → PESANAN_TIBA
    router.push(`/order/buyer/${orderId}/payment`);
  };

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center max-w-[430px] mx-auto bg-white">
        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        <p className="font-semibold font-bitter">Pesanan tidak ditemukan</p>
        <button onClick={() => router.replace('/')} className="text-sm text-primary underline">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-sm font-bold font-bitter text-[#1B1B24] hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
        <p className="text-sm font-bold font-bitter text-[#1B1B24]">Detail Pesanan</p>

        <OrderInfoCard
          orderCode={order.orderCode}
          shopName={order.shopName}
          estimatedTime={order.estimatedTime}
          status={order.status}
          driver={order.driver}
        />

        <DeliveryLocationCard address={order.deliveryAddress} />

        <OrderProgressTimeline steps={steps} />
      </div>

      {/* ── Bottom button ── */}
      <div className="px-5 pb-4 pt-2">
        {isArrived ? (
          <button
            type="button"
            onClick={handleReceive}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-bitter font-semibold text-base"
          >
            Terima Pesanan
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full rounded-2xl py-4 bg-amber-50 text-amber-500 font-bitter font-semibold text-base cursor-not-allowed"
          >
            Sedang Diproses
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
