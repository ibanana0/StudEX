'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Truck } from 'lucide-react';
import {
  Header,
  GreetingSection,
  OpenJastipBanner,
  RecentActivities,
  ActiveOrderBanner,
} from '@/components/home';
import type { ActivityItem } from '@/components/home/RecentActivities';
import { DriverQuickPanel } from '@/components/home/driver';
import BottomNav from '@/components/ui/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/stores/userStore';
import api from '@/utils/api';
import type { Order, OrderStatus } from '@/types/order';

function formatRelativeTime(iso: string): string {
  const created = new Date(iso);
  if (Number.isNaN(created.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Kemarin';
  return `${days} hari lalu`;
}

function statusLabel(status: OrderStatus): string {
  switch (status) {
    case 'MENCARI_DRIVER':
      return 'Mencari driver';
    case 'DIPROSES_DRIVER':
      return 'Driver menuju toko';
    case 'DRIVER_DI_TOKO':
      return 'Driver di toko';
    case 'DALAM_PERJALANAN':
      return 'Dalam perjalanan';
    case 'DRIVER_SAMPAI':
      return 'Driver sampai';
    case 'PESANAN_TIBA':
      return 'Menunggu pembayaran';
    case 'COMPLETED':
      return 'Selesai';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return status;
  }
}

function iconVariantForStatus(status: OrderStatus): 'check' | 'clock' | 'x' {
  if (status === 'COMPLETED') return 'check';
  if (status === 'CANCELLED') return 'x';
  return 'clock';
}

function estimateMinutesLeft(order: Order): number | undefined {
  const created = new Date(order.createdAt);
  if (Number.isNaN(created.getTime())) return undefined;
  const targetMs = created.getTime() + 30 * 60_000;
  const diff = Math.floor((targetMs - Date.now()) / 60_000);
  return diff > 0 ? diff : 0;
}

function toActivityItem(order: Order): ActivityItem {
  return {
    id: order.id,
    title: order.shopName,
    status: statusLabel(order.status),
    time: formatRelativeTime(order.createdAt),
    iconVariant: iconVariantForStatus(order.status),
  };
}

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, needsProfileCompletion, canUseDriverMode, sessionMode } = useAuth();
  const role = useUserStore((s) => s.role);
  const profilePic = useUserStore((s) => s.profilePic);
  const driverProfile = useUserStore((s) => s.driverProfile);
  const setDriverProfile = useUserStore((s) => s.setDriverProfile);
  const userName = useUserStore((s) => s.name);
  const isDriver = role === 'DRIVER';

  const [isOnline, setIsOnline] = useState<boolean>(Boolean(driverProfile?.isActive));
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [poolOrders, setPoolOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    setIsOnline(Boolean(driverProfile?.isActive));
  }, [driverProfile?.isActive]);

  useEffect(() => {
    if (isLoading) return;

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

  const loadBuyerData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [activeRes, recentRes] = await Promise.all([
        api.get<{ data: Order | null }>('/orders/active', { params: { role: 'buyer' } }),
        api.get<{ data: Order[] }>('/orders', { params: { role: 'buyer', limit: 3 } }),
      ]);
      setActiveOrder(activeRes.data.data);
      setRecentOrders(recentRes.data.data);
    } catch (err) {
      console.error('Load buyer home data failed', err);
      setActiveOrder(null);
      setRecentOrders([]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const loadDriverData = useCallback(async () => {
    setDataLoading(true);
    try {
      const activeRes = await api.get<{ data: Order | null }>('/orders/active', {
        params: { role: 'driver' },
      });
      setActiveOrder(activeRes.data.data);

      if (driverProfile?.isActive) {
        const poolRes = await api.get<{ data: Order[] }>('/orders/pool');
        setPoolOrders(poolRes.data.data);
      } else {
        setPoolOrders([]);
      }
    } catch (err) {
      console.error('Load driver home data failed', err);
      setActiveOrder(null);
      setPoolOrders([]);
    } finally {
      setDataLoading(false);
    }
  }, [driverProfile?.isActive]);

  useEffect(() => {
    if (isLoading || !user) return;
    if (isDriver) {
      loadDriverData();
    } else {
      loadBuyerData();
    }
  }, [isDriver, isLoading, loadBuyerData, loadDriverData, user]);

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-bitter text-lg text-[#5F5A74]">Menyiapkan StudEx...</p>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-24 space-y-5">
        <Header profilePic={profilePic} />

        {isDriver ? (
          <>
            <DriverQuickPanel
              isOnline={isOnline}
              onToggle={async () => {
                const next = !isOnline;
                setIsOnline(next);
                try {
                  const { data } = await api.patch<{
                    data: { id: number; isActive: boolean; avgRating: number | string; totalTrips: number };
                  }>('/drivers/me/active', { isActive: next });
                  setDriverProfile({
                    id: data.data.id,
                    isActive: data.data.isActive,
                    avgRating: Number(data.data.avgRating),
                    totalTrips: data.data.totalTrips,
                  });
                } catch (err) {
                  console.error('Toggle driver active failed', err);
                  toast.error('Gagal memperbarui status driver');
                  setIsOnline(!next);
                }
              }}
              totalTrips={driverProfile?.totalTrips ?? 0}
              avgRating={Number(driverProfile?.avgRating ?? 0)}
            />

            {activeOrder && (
              <ActiveOrderBanner
                order={{
                  id: activeOrder.id,
                  shopName: activeOrder.shopName,
                  estimatedMinutes: estimateMinutesLeft(activeOrder),
                }}
                variant="driver"
                onClick={() => router.push(`/order/driver/${activeOrder.id}`)}
              />
            )}

            <div className="space-y-3">
              <h2 className="text-xl font-bold font-bitter text-[#1B1B24]">
                Orderan Tersedia
              </h2>

              {!isOnline ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-500">
                  Aktifkan mode siap menerima pesanan untuk melihat pool order.
                </div>
              ) : dataLoading ? (
                <p className="text-sm text-muted-foreground text-center py-6">Memuat...</p>
              ) : poolOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada orderan tersedia.
                </p>
              ) : (
                <div className="space-y-3">
                  {poolOrders.map((order) => {
                    const isOwnActive = activeOrder?.id === order.id;
                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() =>
                          router.push(
                            isOwnActive
                              ? `/order/driver/${order.id}`
                              : `/order/driver/preview/${order.id}`
                          )
                        }
                        className={`w-full text-left rounded-2xl border p-4 space-y-2 transition-colors ${
                          isOwnActive
                            ? 'bg-orange-50 border-orange-400'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-primary" />
                          <p className="text-sm font-bold font-bitter text-[#1B1B24]">
                            {order.shopName}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {order.deliveryAddress ?? 'Lokasi tujuan'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {Array.isArray(order.itemsDescription)
                            ? `${order.itemsDescription.length} item`
                            : ''}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <GreetingSection userName={userName || user.name} />

            {activeOrder && (
              <ActiveOrderBanner
                order={{
                  id: activeOrder.id,
                  shopName: activeOrder.shopName,
                  estimatedMinutes: estimateMinutesLeft(activeOrder),
                }}
                onClick={() => router.push(`/order/buyer/${activeOrder.id}`)}
              />
            )}

            <OpenJastipBanner onStartOrder={() => router.push('/order')} />
            <RecentActivities
              activities={recentOrders.map(toActivityItem)}
              onActivityClick={(id) => router.push(`/order/buyer/${id}`)}
              onViewAll={() => router.push('/activity')}
            />
          </>
        )}
      </main>

      <BottomNav />
    </>
  );
}
