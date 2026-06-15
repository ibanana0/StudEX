'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMinLoadTime } from '@/hooks/useMinLoadTime';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import type { Transaction, TransactionStatus, Order } from '@/types';
import { Header } from '@/components/home';
import BottomNav from '@/components/ui/BottomNav';
import { TransactionCard } from '@/components/activity';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/stores/userStore';
import api from '@/utils/api';

const TERMINAL_STATUSES = new Set(['COMPLETED', 'CANCELLED']);

function mapOrderToTransaction(order: Order): Transaction {
  let status: TransactionStatus = 'aktif';
  if (order.status === 'COMPLETED') {
    status = 'selesai';
  } else if (order.status === 'CANCELLED') {
    status = 'dibatalkan';
  }

  const description = order.itemsDescription
    ? order.itemsDescription.map((item) => `${item.name} (x${item.qty})`).join(', ')
    : 'Detail pesanan';

  const dateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(order.createdAt));

  return {
    id: `STX-${order.id}`,
    date: dateStr,
    status,
    vendor: order.shopName,
    description,
  };
}

export default function ActivityPage() {
  const router = useRouter();
  const { user, isLoading, needsProfileCompletion, canUseDriverMode, sessionMode } = useAuth();
  const role = useUserStore((s) => s.role);
  const profilePic = useUserStore((s) => s.profilePic);
  const isDriver = role === 'DRIVER';
  const minLoadDone = useMinLoadTime(400);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'ADMIN') {
      router.replace('/admin/drivers');
      return;
    }

    if (needsProfileCompletion) {
      router.replace('/register');
      return;
    }

    if (canUseDriverMode && !sessionMode) {
      router.replace('/profile');
    }
  }, [canUseDriverMode, isLoading, needsProfileCompletion, router, sessionMode, user]);

  const ordersQuery = useQuery({
    queryKey: ['orders', isDriver ? 'driver' : 'buyer'],
    queryFn: async () => {
      const response = await api.get<{ data: Order[] }>(
        `/orders?role=${isDriver ? 'driver' : 'buyer'}`
      );
      return response.data.data;
    },
    enabled: Boolean(user && user.role !== 'ADMIN'),
  });

  if (!minLoadDone || isLoading || !user) {
    return (
      <main className="flex-1 px-5 pt-5 pb-24 space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <SkeletonCard />
          <SkeletonCard />
          <Skeleton className="h-4 w-20 mt-4" />
          <SkeletonCard />
        </div>
      </main>
    );
  }

  const rawOrders = ordersQuery.data ?? [];
  const activeOrders = rawOrders.filter((o) => !TERMINAL_STATUSES.has(o.status));
  const historyOrders = rawOrders.filter((o) => TERMINAL_STATUSES.has(o.status));

  return (
    <>
      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-24 space-y-6">
        <Header profilePic={profilePic} />

        <div className="flex items-center justify-between">
          <h1 className="text-[#1B1B24] text-[22px] font-bold leading-7">
            Aktivitas {isDriver ? 'Driver' : 'Pembeli'}
          </h1>
          {ordersQuery.isFetching && (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          )}
        </div>

        {ordersQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-base font-bold font-bitter text-[#1B1B24]">
                Pesanan Aktif
              </h2>
              {activeOrders.length === 0 ? (
                <p className="text-center py-6 text-sm text-[#464555]">
                  Belum ada pesanan aktif.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeOrders.map((o) => (
                    <TransactionCard key={o.id} tx={mapOrderToTransaction(o)} />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold font-bitter text-[#1B1B24]">Riwayat</h2>
              {historyOrders.length === 0 ? (
                <p className="text-center py-6 text-sm text-[#464555]">
                  Belum ada riwayat transaksi.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {historyOrders.map((o) => (
                    <TransactionCard key={o.id} tx={mapOrderToTransaction(o)} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </>
  );
}

