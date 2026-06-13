'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ActivityTab } from '@/types';
import { Header } from '@/components/home';
import BottomNav from '@/components/ui/BottomNav';
import { ActivityTabs, TransactionCard } from '@/components/activity';
import { DUMMY_TRANSACTIONS, DUMMY_HISTORY } from '@/dummy_payload/activity';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/stores/userStore';

// ── Activity Page ────────────────────────────────────────────────────────────
export default function ActivityPage() {
  const router = useRouter();
  const { user, isLoading, needsProfileCompletion, canUseDriverMode, sessionMode } = useAuth();
  const [activeTab, setActiveTab] = useState<ActivityTab>('dalam-proses');
  const role = useUserStore((s) => s.role);
  const profilePic = useUserStore((s) => s.profilePic);
  const isDriver = role === 'DRIVER';

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
        <p className="font-bitter text-lg text-[#5F5A74]">Memuat aktivitas...</p>
      </div>
    );
  }

  const displayedItems =
    activeTab === 'dalam-proses' ? DUMMY_TRANSACTIONS : DUMMY_HISTORY;

  return (
    <div className="min-h-screen flex flex-col bg-white w-[430px] mx-auto relative">
      {/* ── Main Scrollable Content ── */}
      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-24 space-y-5">
        {/* Header: Logo + Profile */}
        <Header profilePic={profilePic} />

        {/* Page Title */}
        <h1 className="text-[#1B1B24] text-[22px] font-bold leading-7">
          Aktivitas
        </h1>

        {isDriver ? (
          // ── Driver Activity (placeholder — no components yet) ──
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h10M7 12h10M7 17h6" />
              </svg>
            </div>
            <p className="text-lg font-semibold font-bitter text-[#1B1B24]">Aktivitas Driver</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
              Halaman aktivitas untuk driver belum tersedia. Sedang dalam pengembangan.
            </p>
          </div>
        ) : (
          // ── Buyer Activity ──
          <>
            {/* Tab Switcher */}
            <ActivityTabs activeTab={activeTab} onChange={setActiveTab} />

            {/* Transaction Cards */}
            <div className="flex flex-col gap-4">
              {displayedItems.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} />
              ))}
              {displayedItems.length === 0 && (
                <div className="text-center py-12 text-[#464555] text-sm">
                  Tidak ada transaksi
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Bottom Navigation ── */}
      <BottomNav />
    </div>
  );
}
