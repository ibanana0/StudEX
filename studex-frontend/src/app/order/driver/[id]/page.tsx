'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Truck, Store, ShoppingBag, Loader2 } from 'lucide-react';
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
import api from '@/utils/api';

interface OrderDetail {
  id: number;
  shopName: string;
  itemsDescription: { name: string; qty: number; note?: string }[];
  notes: string | null;
  status: string;
  buyerLat: number;
  buyerLng: number;
  driverId: number | null;
  buyer: {
    id: number;
    name: string;
    phoneNumber: string | null;
    profilePic: string | null;
  };
}

export default function DriverOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = parseInt(id, 10);
  const router = useRouter();

  const acceptedOrderId = useUserStore((s) => s.acceptedOrderId);
  const setAcceptedOrderId = useUserStore((s) => s.setAcceptedOrderId);
  const driverOrderStage = useUserStore((s) => s.driverOrderStage);
  const setDriverOrderStage = useUserStore((s) => s.setDriverOrderStage);
  const setPaymentConfirmedOrderId = useUserStore((s) => s.setPaymentConfirmedOrderId);
  const user = useUserStore((s) => s);
  
  const isLockedOut = acceptedOrderId !== null && acceptedOrderId !== orderId;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getStageFromStatus = (status: string, currentStage: DriverOrderStage | null): DriverOrderStage => {
    switch (status) {
      case 'MENCARI_DRIVER': return 'preview';
      case 'DIPROSES_DRIVER': 
        return (currentStage === 'at_store') ? 'at_store' : 'accepted';
      case 'DALAM_PERJALANAN': return 'delivering';
      case 'DRIVER_SAMPAI': return 'payment';
      case 'PESANAN_TIBA': return 'payment';
      case 'COMPLETED': return 'payment';
      default: return 'preview';
    }
  };

  const [stage, setStage] = useState<DriverOrderStage>('preview');
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
        
        // Deteksi jika pesanan dibatalkan pembeli
        if (data.status === 'CANCELLED') {
          toast.error('Mohon maaf, pesanan ini baru saja dibatalkan oleh pembeli.');
          setAcceptedOrderId(null);
          setDriverOrderStage(null);
          router.replace('/order/driver');
          return;
        }

        const isMyOrder = data.driverId === user.id;
        const initialStage = getStageFromStatus(data.status, acceptedOrderId === orderId ? driverOrderStage : null);
        
        if (isMyOrder && initialStage !== stage) {
          setStage(initialStage);
        }
        if (data.status === 'MENCARI_DRIVER') {
          setStage('preview');
        }
      } catch (error) {
        toast.error('Gagal mengambil data pesanan');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId, user.id, acceptedOrderId, driverOrderStage, stage]);

  const displayChecked = useMemo(() => {
    if (!order) return checkedIndices;
    if (stage === 'delivering' || stage === 'payment') {
      return new Set(order.itemsDescription.map((_, i) => i));
    }
    return checkedIndices;
  }, [stage, checkedIndices, order]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white w-[430px] mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

  const advanceTo = (next: DriverOrderStage) => {
    setStage(next);
    setDriverOrderStage(next);
  };

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await api.patch(`/orders/${orderId}/claim`);
      setShowConfirm(false);
      setAcceptedOrderId(orderId);
      advanceTo('accepted');
      toast.success('Orderan berhasil diambil!');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Yah, orderan sudah diambil driver lain.');
        router.replace('/order/driver');
      } else {
        toast.error('Gagal mengambil order');
      }
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAtStore = () => {
    setCheckedIndices(new Set());
    advanceTo('at_store');
    toast.success('Status diperbarui: Sudah di toko');
  };

  const handleToggleItem = (i: number) => {
    setCheckedIndices((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleItemsPicked = async () => {
    if (checkedIndices.size < order.itemsDescription.length) {
      toast.error('Centang semua pesanan terlebih dahulu');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'DALAM_PERJALANAN' });
      advanceTo('delivering');
      toast.success('Pesanan diambil! Menuju titik antar...');
    } catch (error) {
      toast.error('Gagal memperbarui status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelivered = async () => {
    setIsSubmitting(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'DRIVER_SAMPAI' });
      advanceTo('payment');
      toast.success('Pesanan sudah sampai!');
    } catch (error) {
      toast.error('Gagal memperbarui status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentReceived = () => {
    toast.success('Pembayaran diterima! Pesanan selesai.');
    setPaymentConfirmedOrderId(orderId);
    setAcceptedOrderId(null);
    setDriverOrderStage(null);
    router.push('/');
  };

  const statusSubtitle: Record<DriverOrderStage, string> = {
    preview: '',
    accepted: 'Silahkan menuju ke toko',
    at_store: 'Silahkan ambil pesanan',
    delivering: 'Silahkan antar pesanan',
    payment: 'Tunjukkan QRIS kepada pembeli',
  };

  const formattedItems = order.itemsDescription.map(item => ({
    name: item.name,
    qty: item.qty,
    price: 0, 
    shopName: order.shopName,
  }));

  const waUrl = order.buyer.phoneNumber 
    ? `https://wa.me/${order.buyer.phoneNumber.replace(/^0/, '62')}` 
    : '#';
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${order.buyerLat},${order.buyerLng}`;

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
        <button
          type="button"
          onClick={() => router.push('/order/driver')}
          className="flex items-center gap-1 text-sm text-[#1B1B24] font-bold hover:opacity-70 transition-opacity font-bitter"
        >
          <ArrowLeft className="w-4 h-4" />
          {stage === 'preview' ? 'List Order' : 'Home'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
        <h1 className="text-2xl font-bold font-bitter text-[#1B1B24]">Detail Pesanan</h1>

        {stage === 'payment' ? (
          <QrisPaymentView
            driverName={user.name}
            driverId={user.driverProfile?.id ?? 1}
            qrisUrl={user.driverProfile?.qrisUrl ?? ''}
          />
        ) : (
          <>
            {stage !== 'preview' && (
              <AcceptedStatusCard subtitle={statusSubtitle[stage]} />
            )}

            <OrderItemsCard
              title={order.shopName}
              items={formattedItems}
              interactive={stage === 'at_store'}
              checkedIndices={displayChecked}
              onToggle={handleToggleItem}
            />

            <OrderRouteCard
              pickupPoint={order.shopName}
              deliveryPoint="Lokasi Pembeli"
            />

            <BuyerInfoCard
              buyerName={order.buyer.name}
              buyerPhone={order.buyer.phoneNumber || '-'}
              deliveryAddress="Lihat di Maps"
              deliveryLat={Number(order.buyerLat)}
              deliveryLng={Number(order.buyerLng)}
            />
            
            {(stage === 'delivering' || stage === 'at_store' || stage === 'accepted') && (
              <div className="flex gap-2">
                <a href={waUrl} target="_blank" rel="noreferrer" className="flex-1 flex justify-center py-3 bg-[#E8F5E9] text-[#2E7D32] rounded-xl text-sm font-semibold font-bitter">
                  Chat Pembeli
                </a>
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex-1 flex justify-center py-3 bg-[#E3F2FD] text-[#1565C0] rounded-xl text-sm font-semibold font-bitter">
                  Buka Rute Maps
                </a>
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-5 pb-4 pt-2">
        {stage === 'preview' && (
          <button
            type="button"
            disabled={isLockedOut || isSubmitting}
            onClick={() => !isLockedOut && setShowConfirm(true)}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bitter font-semibold text-base transition-colors ${
              isLockedOut
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white cursor-pointer'
            }`}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
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
            disabled={isSubmitting}
            onClick={handleItemsPicked}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-bitter font-semibold text-base disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Store className="w-5 h-5" />}
            Saya sudah mengambil pesanan
          </button>
        )}

        {stage === 'delivering' && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleDelivered}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-bitter font-semibold text-base disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
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

      {/* No BottomNav in detail page if you want full height for map/actions, but here I keep it per original layout */}

      {showConfirm && (
        <ConfirmAcceptModal
          orderTitle={order.shopName}
          onConfirm={handleAccept}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
