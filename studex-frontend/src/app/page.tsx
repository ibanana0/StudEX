'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Header,
  GreetingSection,
  OpenJastipBanner,
  RecentActivities,
  ActiveOrderBanner,
} from '@/components/home';
import { DriverQuickPanel, AvailableOrdersList } from '@/components/home/driver';
import BottomNav from '@/components/ui/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { DUMMY_USER_NAME, DUMMY_ACTIVITIES, DUMMY_ACTIVE_ORDER } from '@/dummy_payload/home';
import { DUMMY_AVAILABLE_ORDERS } from '@/dummy_payload/driver_home';
import { useUserStore } from '@/stores/userStore';

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, needsProfileCompletion, canUseDriverMode, sessionMode } = useAuth();
  const role = useUserStore((s) => s.role);
  const profilePic = useUserStore((s) => s.profilePic);
  const driverProfile = useUserStore((s) => s.driverProfile);
  const isDriver = role === 'DRIVER';

  const [isOnline, setIsOnline] = useState(false);

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

  if (isLoading || !user) {
    return (
      <div className="mx-auto flex min-h-screen w-[430px] items-center justify-center bg-white">
        <p className="font-bitter text-lg text-[#5F5A74]">Menyiapkan StudEx...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white w-[430px] mx-auto relative">
      {/* ── Main Scrollable Content ── */}
      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-24 space-y-5">
        {/* Header: Logo + Profile */}
        <Header profilePic={profilePic} />

        {isDriver ? (
          // ── Driver Home ──
          <>
            <DriverQuickPanel
              isOnline={isOnline}
              onToggle={() => setIsOnline((v) => !v)}
              totalTrips={driverProfile?.totalTrips ?? 0}
              avgRating={driverProfile?.avgRating ?? 0}
            />

            <div className="space-y-3">
              <h2 className="text-xl font-bold font-bitter text-[#1B1B24]">
                Orderan Tersedia
              </h2>
              <AvailableOrdersList orders={DUMMY_AVAILABLE_ORDERS} />
            </div>
          </>
        ) : (
          // ── Buyer Home ──
          <>
            <GreetingSection userName={DUMMY_USER_NAME} />

            {/* Active order banner — shown when driver has accepted buyer's order */}
            {DUMMY_ACTIVE_ORDER && (
              <ActiveOrderBanner
                order={DUMMY_ACTIVE_ORDER}
                onClick={() => router.push(`/order/buyer/${DUMMY_ACTIVE_ORDER.id}`)}
              />
            )}

            <OpenJastipBanner onStartOrder={() => router.push('/order')} />
            <RecentActivities activities={DUMMY_ACTIVITIES} />
          </>
        )}
      </main>

      {/* ── Bottom Navigation ── */}
      <BottomNav />
    </div>
  );
}
