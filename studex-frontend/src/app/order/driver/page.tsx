'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

import BottomNav from '@/components/ui/BottomNav';
import { ConfirmAcceptModal } from '@/components/order-driver';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

interface PoolOrder {
  id: number;
  shopName: string;
  estItemPrice: number;
  deliveryFee: number;
  buyerLat: number;
  buyerLng: number;
  createdAt: string;
  buyer: {
    name: string;
    profilePic: string | null;
  };
}

export default function OrderPoolPage() {
  const router = useRouter();
  const { user, isLoading, sessionMode } = useAuth();
  
  const [orders, setOrders] = useState<PoolOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PoolOrder | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user || sessionMode !== 'DRIVER') {
      router.replace('/');
      return;
    }

    const fetchPool = async () => {
      try {
        const { data } = await api.get('/orders/pool');
        setOrders(data.data);
      } catch (error) {
        toast.error('Gagal mengambil daftar order');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchPool();
    const intervalId = setInterval(fetchPool, 10000);
    return () => clearInterval(intervalId);
  }, [isLoading, user, sessionMode, router]);

  const handleClaim = async () => {
    if (!selectedOrder) return;
    
    setIsClaiming(true);
    try {
      await api.patch(`/orders/${selectedOrder.id}/claim`);
      toast.success('Berhasil mengambil order!');
      router.push(`/order/driver/${selectedOrder.id}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Yah, orderan sudah diambil driver lain.');
        setOrders(orders.filter(o => o.id !== selectedOrder.id));
      } else {
        toast.error('Gagal mengambil order');
      }
    } finally {
      setIsClaiming(false);
      setSelectedOrder(null);
    }
  };

  if (isLoading || loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8FB] w-[430px] mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8FB] w-[430px] mx-auto relative pb-20">
      <div className="flex items-center gap-3 p-4 bg-white sticky top-0 z-10 border-b border-[#F0F0F5]">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="p-1 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg font-bitter">Daftar Jastip Tersedia</h1>
      </div>

      <main className="flex-1 p-4 flex flex-col gap-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#F0F0F5]">
              <span className="text-4xl">😴</span>
            </div>
            <h2 className="text-[#1B1B24] font-semibold font-bitter text-lg">Belum ada orderan</h2>
            <p className="text-[#5F5A74] text-sm mt-1">Tunggu sebentar lagi ya, rezeki nggak ke mana.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0F0F5] flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    {order.buyer.profilePic ? (
                      <img src={order.buyer.profilePic} alt={order.buyer.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                        {order.buyer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#1B1B24]">{order.buyer.name}</h3>
                    <p className="text-xs text-[#5F5A74]">Belanja di {order.shopName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">Rp {order.deliveryFee.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-[#5F5A74]">Ongkir</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#464555] bg-[#F8F8FB] p-2 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Pengantaran ke lokasi pembeli</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(order)}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm mt-1 active:scale-[0.98] transition-transform"
              >
                Ambil Order
              </button>
            </div>
          ))
        )}
      </main>

      {selectedOrder && (
        <ConfirmAcceptModal
          orderTitle={selectedOrder.shopName}
          onConfirm={handleClaim}
          onCancel={() => setSelectedOrder(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
