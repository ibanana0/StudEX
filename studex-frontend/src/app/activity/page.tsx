'use client';

import { useState } from 'react';
import type { ActivityTab } from '@/types';
import { Header } from '@/components/home';
import BottomNav from '@/components/ui/BottomNav';
import { ActivityTabs, TransactionCard } from '@/components/activity';
import { DUMMY_TRANSACTIONS, DUMMY_HISTORY } from '@/dummy_payload/activity';
import { DUMMY_PROFILE_PIC } from '@/dummy_payload/home';

// ── Activity Page ────────────────────────────────────────────────────────────
export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<ActivityTab>('dalam-proses');

  const displayedItems =
    activeTab === 'dalam-proses' ? DUMMY_TRANSACTIONS : DUMMY_HISTORY;

  return (
    <div className="min-h-screen flex flex-col bg-white w-[430px] mx-auto relative">
      {/* ── Main Scrollable Content ── */}
      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-24 space-y-5">
        {/* Header: Logo + Profile */}
        <Header profilePic={DUMMY_PROFILE_PIC} />

        {/* Page Title */}
        <h1 className="text-[#1B1B24] text-[22px] font-bold leading-7">
          Aktivitas
        </h1>

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
      </main>

      {/* ── Bottom Navigation ── */}
      <BottomNav />
    </div>
  );
}
