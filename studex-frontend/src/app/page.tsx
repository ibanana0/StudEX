'use client';

import { useRouter } from 'next/navigation';
import {
  Header,
  GreetingSection,
  OpenJastipBanner,
  RecentActivities,
} from '@/components/home';
import BottomNav from '@/components/ui/BottomNav';
import {
  DUMMY_USER_NAME,
  DUMMY_PROFILE_PIC,
  DUMMY_ACTIVITIES,
} from '@/dummy_payload/home';

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white w-[430px] mx-auto relative">
      {/* ── Main Scrollable Content ── */}
      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-24 space-y-5">
        {/* Header: Logo + Profile */}
        <Header profilePic={DUMMY_PROFILE_PIC} />

        {/* Greeting */}
        <GreetingSection userName={DUMMY_USER_NAME} />

        {/* Open Jastip CTA Banner */}
        <OpenJastipBanner onStartOrder={() => router.push('/order')} />

        {/* Recent Activities */}
        <RecentActivities activities={DUMMY_ACTIVITIES} />
      </main>

      {/* ── Bottom Navigation ── */}
      <BottomNav />
    </div>
  );
}
