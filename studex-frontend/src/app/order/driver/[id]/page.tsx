'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Truck, Store, ShoppingBag } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import type { DriverOrderStage } from '@/types/order';
import toast from 'react-hot-toast';
import BottomNav from '@/components/ui/BottomNav';
import {
  OrderItemsCard,
  OrderRouteCard,
  BuyerInfoCard,
  AcceptedStatusCard,
  ConfirmAcceptModal,
  QrisPaymentView,
} from '@/components/order-driver';
import { DUMMY_AVAILABLE_ORDERS } from '@/dummy_payload/driver_home';

export default function DriverOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = parseInt(id, 10);
  const router  = useRouter();

  const acceptedOrderId     = useUserStore((s) => s.acceptedOrderId);
  const setAcceptedOrderId          = useUserStore((s) => s.setAcceptedOrderId);
  const setDriverOrderStage         = useUserStore((s) => s.setDriverOrderStage);
  const setPaymentConfirmedOrderId  = useUserStore((s) => s.setPaymentConfirmedOrderId);
  const user                        = useUserStore((s) => s);
  const isLockedOut = acceptedOrderId !== null && acceptedOrderId !== orderId;

  // Restore persisted stage if this order is already active
  const [stage, setStage] = useState<DriverOrderStage>(() => {
    const s = useUserStore.getState();
    if (s.acceptedOrderId === orderId && s.driverOrderStage) return s.driverOrderStage;
    return 'preview';
  });

  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [showConfirm, setShowConfirm]       = useState(false);

  const order = DUMMY_AVAILABLE_ORDERS.find((o) => o.id === orderId);

  // All items shown as checked once driver proceeds past at_store
  const displayChecked = useMemo(() => {
    if (!order) return checkedIndices;
    if (stage === 'delivering' || stage === 'payment') {
      return new Set(order.items.map((_, i) => i));
    }
    return checkedIndices;
  }, [stage, checkedIndices, order]);

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

  // ── stage helpers ─────────────────────────────────────────────────────────────
  const advanceTo = (next: DriverOrderStage) => {
    setStage(next);
    setDriverOrderStage(next);
  };

  const handleAccept = () => {
    setShowConfirm(false);
    setAcceptedOrderId(orderId);
    advanceTo('accepted');
    toast.success('Orderan berhasil diambil!');
    // TODO [API]: POST /orders/:id/accept → status: DIPROSES_DRIVER
  };

  const handleAtStore = () => {
    setCheckedIndices(new Set());
    advanceTo('at_store');
    toast.success('Status diperbarui: Sudah di toko');
    // TODO [API]: PATCH /orders/:id/status → DIPROSES_DRIVER (sub-step: at_store)
  };

  const handleToggleItem = (i: number) => {
    setCheckedIndices((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleItemsPicked = () => {
    if (checkedIndices.size < order.items.length) {
      toast.error('Centang semua pesanan terlebih dahulu');
      return;
    }
    advanceTo('delivering');
    toast.success('Pesanan diambil! Menuju titik antar...');
    // TODO [API]: PATCH /orders/:id/status → DALAM_PERJALANAN
    router.push('/');
  };

  const handleDelivered = () => {
    advanceTo('payment');
    // TODO [API]: PATCH /orders/:id/status → DRIVER_SAMPAI
  };

  const handlePaymentReceived = () => {
    // Signal to buyer's payment page that payment is confirmed
    setPaymentConfirmedOrderId(orderId);
    // Clear active order wizard state
    setAcceptedOrderId(null);
    setDriverOrderStage(null);
    toast.success('Pembayaran diterima! Pesanan selesai.');
    // TODO [API]: PATCH /orders/:id/status → COMPLETED
    router.push('/');
  };

  // ── status card subtitles ─────────────────────────────────────────────────────
  const statusSubtitle: Record<DriverOrderStage, string> = {
    preview:    '',
    accepted:   'Silahkan menuju ke titik tujuan',
    at_store:   'Silahkan ambil pesanan',
    delivering: 'Silahkan antar pesanan',
    payment:    'Tunjukkan QRIS kepada pembeli',
  };

  const isPaymentStage = stage === 'payment';

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-sm text-[#1B1B24] font-bold hover:opacity-70 transition-opacity font-bitter"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
        <h1 className="text-2xl font-bold font-bitter text-[#1B1B24]">Detail Pesanan</h1>

        {isPaymentStage ? (
          /* ── Payment stage: show QRIS only ── */
          <QrisPaymentView
            driverName={user.name}
            driverId={user.driverProfile?.id ?? 1}
            qrisUrl={user.driverProfile?.qrisUrl ?? ''}
          />
        ) : (
          /* ── All other stages: show order detail ── */
          <>
            {stage !== 'preview' && (
              <AcceptedStatusCard subtitle={statusSubtitle[stage]} />
            )}

            <OrderItemsCard
              title={order.title}
              items={order.items}
              interactive={stage === 'at_store'}
              checkedIndices={displayChecked}
              onToggle={handleToggleItem}
            />

            <OrderRouteCard
              pickupPoint={order.pickupPoint}
              deliveryPoint={order.deliveryPoint}
            />

            <BuyerInfoCard
              buyerName={order.buyerName}
              buyerPhone={order.buyerPhone}
              deliveryAddress={order.deliveryAddress}
              deliveryLat={order.deliveryLat}
              deliveryLng={order.deliveryLng}
            />
          </>
        )}
      </div>

      {/* ── Bottom action button ── */}
      <div className="px-5 pb-4 pt-2">
        {stage === 'preview' && (
          <button
            type="button"
            disabled={isLockedOut}
            onClick={() => !isLockedOut && setShowConfirm(true)}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bitter font-semibold text-base transition-colors ${
              isLockedOut
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white cursor-pointer'
            }`}
          >
            <Truck className="w-5 h-5" />
            {isLockedOut ? 'Selesaikan order aktif dulu' : 'Ambil Orderan'}
          </button>
        )}

        {stage === 'accepted' && (
          <button
            type="button"
            onClick={handleAtStore}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-bitter font-semibold text-base"
          >
            <Store className="w-5 h-5" />
            Saya sudah di toko
          </button>
        )}

        {stage === 'at_store' && (
          <button
            type="button"
            onClick={handleItemsPicked}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-bitter font-semibold text-base"
          >
            <Store className="w-5 h-5" />
            Saya sudah mengambil pesanan
          </button>
        )}

        {stage === 'delivering' && (
          <button
            type="button"
            onClick={handleDelivered}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-bitter font-semibold text-base"
          >
            <Truck className="w-5 h-5" />
            Saya sudah antar pesanan
          </button>
        )}

        {stage === 'payment' && (
          <button
            type="button"
            onClick={handlePaymentReceived}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-bitter font-semibold text-base"
          >
            Saya sudah menerima pembayaran
          </button>
        )}
      </div>

      <BottomNav />

      {showConfirm && (
        <ConfirmAcceptModal
          orderTitle={order.title}
          onConfirm={handleAccept}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
