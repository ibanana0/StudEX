'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Truck, Store, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';
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
import ConfirmationModal from '@/components/modal/ConfirmationModal';
import ReportModal from '@/components/modal/ReportModal';
import api from '@/utils/api';

interface OrderDetail {
  id: number;
  shopName: string;
  itemsDescription: { name: string; qty: number; note?: string }[];
  notes: string | null;
  status: string;
  buyerLat: number;
  buyerLng: number;
  deliveryAddress: string | null;
  driverId: number | null;
  buyer: {
    id: number;
    name: string;
    phoneNumber: string | null;
    profilePic: string | null;
  };
  driver?: {
    id: number;
    name: string;
    driverProfile?: { qrisUrl?: string; avgRating?: number };
  } | null;
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
      case 'DRIVER_DI_TOKO': return 'at_store';
      case 'DALAM_PERJALANAN': return 'delivering';
      case 'DRIVER_SAMPAI': return 'waiting_buyer';
      case 'PESANAN_TIBA': return 'payment';
      case 'COMPLETED': return 'completed';
      default: return 'preview';
    }
  };

  const [stage, setStage] = useState<DriverOrderStage>('preview');
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [statusConfirmConfig, setStatusConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    icon?: any;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

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
          router.replace('/');
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
    if (stage === 'delivering' || stage === 'waiting_buyer' || stage === 'payment' || stage === 'completed') {
      return new Set(order.itemsDescription.map((_, i) => i));
    }
    return checkedIndices;
  }, [stage, checkedIndices, order]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
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
        router.replace('/');
      } else {
        toast.error('Gagal mengambil order');
      }
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAtStore = async () => {
    setIsSubmitting(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'DRIVER_DI_TOKO' });
      setCheckedIndices(new Set());
      advanceTo('at_store');
      toast.success('Status diperbarui: Sudah di toko');
      setStatusConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      toast.error('Gagal memperbarui status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerAtStoreConfirm = () => {
    setStatusConfirmConfig({
      isOpen: true,
      title: 'Sudah Sampai di Toko?',
      description: 'Pastikan Anda sudah berada di lokasi toko untuk mulai membeli barang belanjaan pembeli.',
      confirmLabel: 'Ya, Saya di Toko',
      icon: Store,
      onConfirm: handleAtStore,
    });
  };

  const handleToggleItem = (i: number) => {
    setCheckedIndices((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleItemsPicked = async () => {
    setIsSubmitting(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'DALAM_PERJALANAN' });
      advanceTo('delivering');
      toast.success('Pesanan diambil! Menuju titik antar...');
      setStatusConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      toast.error('Gagal memperbarui status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerItemsPickedConfirm = () => {
    if (checkedIndices.size < order.itemsDescription.length) {
      toast.error('Centang semua pesanan terlebih dahulu');
      return;
    }
    setStatusConfirmConfig({
      isOpen: true,
      title: 'Pesanan Selesai Diambil?',
      description: 'Apakah Anda sudah membeli semua barang belanjaan dan siap untuk memulai pengantaran?',
      confirmLabel: 'Ya, Mulai Mengantar',
      icon: ShoppingBag,
      onConfirm: handleItemsPicked,
    });
  };

  const handleDelivered = async () => {
    setIsSubmitting(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'DRIVER_SAMPAI' });
      advanceTo('waiting_buyer');
      toast.success('Pesanan sudah sampai! Menunggu konfirmasi pembeli.');
      setStatusConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      toast.error('Gagal memperbarui status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDeliveredConfirm = () => {
    setStatusConfirmConfig({
      isOpen: true,
      title: 'Sudah Sampai di Tujuan?',
      description: 'Apakah Anda sudah sampai di titik pengantaran dan siap menemui pembeli?',
      confirmLabel: 'Ya, Saya Sudah Sampai',
      icon: Truck,
      onConfirm: handleDelivered,
    });
  };

  const handlePaymentReceived = async () => {
    setIsSubmitting(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'COMPLETED' });
      toast.success('Pembayaran diterima! Pesanan selesai.');
      setPaymentConfirmedOrderId(orderId);
      setAcceptedOrderId(null);
      setDriverOrderStage(null);
      setStatusConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      router.push('/');
    } catch (error) {
      toast.error('Gagal menyelesaikan pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerPaymentReceivedConfirm = () => {
    setStatusConfirmConfig({
      isOpen: true,
      title: 'Konfirmasi Pembayaran?',
      description: 'Pastikan Anda sudah menerima pembayaran (baik tunai atau transfer m-banking) sebelum menyelesaikan pesanan ini.',
      confirmLabel: 'Ya, Pembayaran Diterima',
      icon: CheckCircle2,
      onConfirm: handlePaymentReceived,
    });
  };

  const statusSubtitle: Record<DriverOrderStage, string> = {
    preview: '',
    accepted: 'Silahkan menuju ke toko',
    at_store: 'Silahkan ambil pesanan',
    delivering: 'Silahkan antar pesanan',
    waiting_buyer: 'Menunggu pembeli menekan "Terima Pesanan"',
    payment: 'Tunjukkan QRIS kepada pembeli',
    completed: 'Pesanan telah selesai',
  };

  const formattedItems = order.itemsDescription.map(item => ({
    name: item.name,
    qty: item.qty,
    price: 0, 
    shopName: order.shopName,
  }));

  return (
    <>
      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
        <button
          type="button"
          onClick={() => router.push('/')}
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
            qrisUrl={order.driver?.driverProfile?.qrisUrl ?? ''}
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
              deliveryAddress={order.deliveryAddress || 'Lihat di Maps'}
              deliveryLat={Number(order.buyerLat)}
              deliveryLng={Number(order.buyerLng)}
              onReportClick={() => setIsReportOpen(true)}
              isCompleted={stage === 'completed'}
            />
            
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
            onClick={triggerAtStoreConfirm}
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
            onClick={triggerItemsPickedConfirm}
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
            onClick={triggerDeliveredConfirm}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-bitter font-semibold text-base disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
            Saya sudah antar pesanan
          </button>
        )}

        {stage === 'waiting_buyer' && (
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 border border-gray-200 text-primary font-bitter font-semibold text-base opacity-60 cursor-not-allowed"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Menunggu konfirmasi pembeli...
          </button>
        )}

        {stage === 'payment' && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={triggerPaymentReceivedConfirm}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-bitter font-semibold text-base disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            Saya sudah menerima pembayaran
          </button>
        )}

        {stage === 'completed' && (
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 bg-green-50 text-green-600 font-bitter font-semibold text-base cursor-not-allowed"
          >
            <CheckCircle2 className="w-5 h-5" />
            Pesanan Selesai
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

      <ConfirmationModal
        isOpen={statusConfirmConfig.isOpen}
        onClose={() => setStatusConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={statusConfirmConfig.onConfirm}
        title={statusConfirmConfig.title}
        description={statusConfirmConfig.description}
        confirmLabel={statusConfirmConfig.confirmLabel}
        icon={statusConfirmConfig.icon}
        isLoading={isSubmitting}
      />

      {isReportOpen && (
        <ReportModal
          reportedId={order.buyer.id}
          reportedName={order.buyer.name}
          orderId={order.id}
          onClose={() => setIsReportOpen(false)}
          onSuccess={() => setIsReportOpen(false)}
        />
      )}
    </>
  );
}
