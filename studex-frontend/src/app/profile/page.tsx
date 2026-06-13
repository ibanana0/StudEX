'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Role } from '@/types/user';

import { Header } from '@/components/home';
import BottomNav from '@/components/ui/BottomNav';
import { ProfileCard, ModeToggle, ModeSwitchModal, DriverCTACard } from '@/components/profile';
import { useUserStore } from '@/stores/userStore';

export default function ProfilePage() {
  const router = useRouter();

  // TODO [AUTH]: When auth is implemented, check if the user is logged in.
  // If not logged in, redirect to /login or /register page.

  // Read from global store
  const user = useUserStore();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  const username = user.email.split('@')[0];

  const handleToggle = (targetRole: Role) => {
    if (targetRole === user.role) return;
    setPendingRole(targetRole);
  };

  const handleConfirmSwitch = () => {
    if (!pendingRole) return;

    // Mutate the global store — home/activity will react automatically
    user.setRole(pendingRole);

    toast.success(
      pendingRole === 'DRIVER'
        ? 'Berhasil beralih ke mode Driver'
        : 'Berhasil beralih ke mode Pembeli'
    );
    setPendingRole(null);
    // TODO [API]: Call backend to persist role change
  };

  const handleCancelSwitch = () => setPendingRole(null);

  const handleLogout = () => {
    // TODO [AUTH]: Implement logout logic (clear token, redirect to /login)
    toast.success('Berhasil keluar');
  };

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      {/* ── Scrollable content ── */}
      <div className="flex flex-col flex-1 px-5 pt-5">
        <Header profilePic={user.profilePic} />

        <div className="pt-5 pb-5">
          <ProfileCard
            name={user.name}
            username={username}
            email={user.email}
            role={user.role}
            isDriverVerified={user.isDriverVerified}
          />
        </div>

        <div className="pt-1 space-y-4">
          <ModeToggle currentRole={user.role} onToggle={handleToggle} />

          {/* Driver CTA — only show when user does NOT have a driver account */}
          {!user.hasDriverAccount && (
            <DriverCTACard onClick={() => router.push('/profile/daftar-driver')} />
          )}

          {/* TODO [AUTH]: When hasDriverAccount is true and user is a verified driver,
              you may show a "Kelola Akun Driver" or "Dashboard Driver" card instead. */}
        </div>

        {/* Push logout to bottom */}
        <div className="flex-1" />

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 mb-4 bg-[#FDEDED] text-[#C0392B] font-semibold font-bitter text-base hover:bg-[#FADBD8] transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>

      <BottomNav />

      {pendingRole && (
        <ModeSwitchModal
          targetRole={pendingRole}
          onConfirm={handleConfirmSwitch}
          onCancel={handleCancelSwitch}
        />
      )}
    </div>
  );
}
