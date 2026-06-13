'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Role } from '@/types/user';

import { Header } from '@/components/home';
import BottomNav from '@/components/ui/BottomNav';
import { ProfileCard, ModeToggle, ModeSwitchModal } from '@/components/profile';
import { DUMMY_PROFILE } from '@/dummy_payload/profile';

export default function ProfilePage() {
  const [currentRole, setCurrentRole] = useState<Role>(DUMMY_PROFILE.role);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  const handleToggle = (targetRole: Role) => {
    if (targetRole === currentRole) return;
    setPendingRole(targetRole);
  };

  const handleConfirmSwitch = () => {
    if (!pendingRole) return;
    setCurrentRole(pendingRole);
    toast.success(
      pendingRole === 'DRIVER'
        ? 'Berhasil beralih ke mode Driver'
        : 'Berhasil beralih ke mode Pembeli'
    );
    setPendingRole(null);
  };

  const handleCancelSwitch = () => setPendingRole(null);

  const handleLogout = () => {
    // TODO [AUTH]: clear token, redirect to /login
    toast.success('Berhasil keluar');
  };

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      {/* ── Scrollable content ── */}
      <div className="flex flex-col flex-1 px-5 pt-5">
        <Header profilePic={DUMMY_PROFILE.profilePic} />

        <div className="pt-5 pb-5">
          <ProfileCard
            name={DUMMY_PROFILE.name}
            username={DUMMY_PROFILE.username}
            email={DUMMY_PROFILE.email}
            profilePic={DUMMY_PROFILE.profilePic}
            role={currentRole}
            isDriverVerified={DUMMY_PROFILE.isDriverVerified}
          />
        </div>

        <div className="pt-1">
          <ModeToggle currentRole={currentRole} onToggle={handleToggle} />
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
