'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, MapPin, ShoppingBag, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/utils/api';
import { useUserStore } from '@/stores/userStore';
import type { Order } from '@/types/order';

export default function DriverOrderPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = Number.parseInt(id, 10);
  const router = useRouter();
  const myId = useUserStore((s) => s.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (Number.isNaN(orderId)) {
      router.replace('/');
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get<{ data: Order }>(`/orders/pool/${orderId}`);
        if (cancelled) return;
        if (data.data.driverId && data.data.driverId === myId) {
          router.replace(`/order/driver/${orderId}`);
          return;
        }
        setOrder(data.data);
      } catch (err: any) {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 409 || status === 404) {
          toast.error('Order tidak tersedia lagi');
          router.replace('/');
          return;
        }
        if (status === 403) {
          toast.error(err?.response?.data?.message ?? 'Driver offline');
          router.replace('/');
          return;
        }
        toast.error('Gagal memuat detail order');
        router.replace('/');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId, router, myId]);

  const handleClaim = async () => {
    if (!order) return;
    setIsClaiming(true);
    try {
      await api.patch(`/orders/${order.id}/claim`);
      toast.success('Orderan berhasil diambil!');
      router.replace(`/order/driver/${order.id}`);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error('Orderan sudah diambil driver lain');
        router.replace('/');
        return;
      }
      if (status === 400) {
        toast.error(err?.response?.data?.message ?? 'Tidak dapat klaim order');
      } else if (status === 403) {
        toast.error(err?.response?.data?.message ?? 'Driver offline');
      } else {
        toast.error('Gagal mengambil order');
      }
    } finally {
      setIsClaiming(false);
    }
  };

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
        <p className="font-semibold font-bitter">Order tidak ditemukan</p>
        <button onClick={() => router.replace('/')} className="text-sm text-primary underline">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <>
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

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
        <h1 className="text-2xl font-bold font-bitter text-[#1B1B24]">Preview Orderan</h1>

        <div className="rounded-2xl border border-gray-200 p-4 space-y-2">
          <p className="text-xs text-gray-500 font-bitter">Toko</p>
          <p className="text-base font-bold font-bitter text-[#1B1B24]">{order.shopName}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
          <p className="text-xs text-gray-500 font-bitter">Item Pesanan</p>
          <ul className="space-y-2">
            {order.itemsDescription.map((item, idx) => (
              <li key={idx} className="text-sm text-[#1B1B24]">
                <span className="font-semibold">{item.qty}x</span> {item.name}
                {item.note && <span className="text-gray-500"> — {item.note}</span>}
              </li>
            ))}
          </ul>
          {order.notes && (
            <p className="text-xs text-gray-500 border-t border-gray-100 pt-2">
              Catatan: {order.notes}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-bitter">Titik Antar</p>
              <p className="text-sm text-[#1B1B24]">
                {order.deliveryAddress ?? '-'}
              </p>
              <a
                href={`https://www.google.com/maps?q=${order.buyerLat},${order.buyerLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-semibold underline mt-1 inline-block"
              >
                Buka di Google Maps
              </a>
            </div>
          </div>
        </div>

        {order.buyer?.name && (
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-bitter">Pembeli</p>
            <p className="text-sm font-bold font-bitter text-[#1B1B24]">{order.buyer.name}</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-4 pt-2">
        <button
          type="button"
          disabled={isClaiming}
          onClick={handleClaim}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-4 font-bitter font-semibold text-base disabled:opacity-70"
        >
          {isClaiming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
          Ambil Pesanan
        </button>
      </div>
    </>
  );
}
