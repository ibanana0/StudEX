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

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BottomNav from '@/components/ui/BottomNav';
import {
  OrderInfoCard,
  DeliveryLocationCard,
  OrderProgressTimeline,
  deriveProgressSteps,
} from '@/components/order-buyer';
import { useOrderPolling } from '@/hooks/useOrderPolling';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';

export default function BuyerOrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = parseInt(id, 10);
  const router = useRouter();
  const { sessionMode, isLoading: isAuthLoading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (sessionMode === 'DRIVER') {
      router.replace('/');
    }
  }, [isAuthLoading, sessionMode, router]);

  const { data: order, isLoading, isError } = useOrderPolling(
    isNaN(orderId) ? null : orderId
  );

  const steps = useMemo(() => {
    if (!order) return [];
    return deriveProgressSteps(
      order.status,
      order.stepTimestamps ?? {},
      order.deliveryAddress ?? 'Kampus UI Depok',
    );
  }, [order]);

  const isArrived = order?.status === 'DRIVER_SAMPAI' || order?.status === 'PESANAN_TIBA' || order?.status === 'COMPLETED';

  const handleReceive = async () => {
    if (!order) return;

    if (order.status === 'DRIVER_SAMPAI') {
      setIsUpdating(true);
      try {
        await api.patch(`/orders/${orderId}/status`, { status: 'PESANAN_TIBA' });
        toast.success('Pesanan diterima! Silakan lakukan pembayaran.');
        router.push(`/order/buyer/${orderId}/payment`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Gagal memperbarui status');
      } finally {
        setIsUpdating(false);
      }
    } else {
      router.push(`/order/buyer/${orderId}/payment`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isNaN(orderId) || isError || !order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        <p className="font-semibold font-bitter">Pesanan tidak ditemukan</p>
        <button onClick={() => router.replace('/')} className="text-sm text-primary underline">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <>
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
          orderCode={order.orderCode ?? ''}
          shopName={order.shopName}
          estimatedTime={order.estimatedTime ?? ''}
          status={order.status}
          driver={order.driver as any}
        />

        <DeliveryLocationCard address={order.deliveryAddress ?? 'Kampus UI Depok'} />


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
    </>
  );
}
