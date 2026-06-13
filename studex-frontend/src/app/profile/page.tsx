'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Role } from '@/types/user';

import { Header } from '@/components/home';
import BottomNav from '@/components/ui/BottomNav';
import {
  ProfileCard,
  ModeToggle,
  ModeSwitchModal,
  DriverCTACard,
  SessionModeChooser,
} from '@/components/profile';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const store = useUserStore();
  const {
    user,
    isLoading,
    canUseDriverMode,
    needsProfileCompletion,
    sessionMode,
    logout,
    setSessionMode,
  } = useAuth();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

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
    }
  }, [isLoading, needsProfileCompletion, router, user]);

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
    router.replace('/login');
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen max-w-[430px] items-center justify-center bg-white mx-auto">
        <p className="font-bitter text-lg text-[#5F5A74]">Memuat profil...</p>
      </div>
    );
  }

  if (canUseDriverMode && !sessionMode) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-white px-5 pt-5">
        <Header profilePic={user.profilePic} />

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full space-y-4">
            <SessionModeChooser
              title="Pilih mode untuk sesi ini"
              description="Akunmu bisa dipakai sebagai pembeli maupun driver. Pilih tampilan yang ingin kamu gunakan sekarang."
              onSelect={(mode) => {
                setSessionMode(mode);
                toast.success(
                  mode === 'DRIVER'
                    ? 'Mode Driver diaktifkan'
                    : 'Mode Pembeli diaktifkan'
                );
                router.replace('/');
              }}
            />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-2xl bg-[#FDEDED] py-4 font-bitter text-base font-semibold text-[#C0392B]"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleToggle = (targetRole: Role) => {
    if (targetRole === store.role) {
      return;
    }

    if (targetRole === 'DRIVER' && !canUseDriverMode) {
      toast.error('Mode Driver akan aktif setelah verifikasi admin');
      return;
    }

    setPendingRole(targetRole);
  };

  const handleConfirmSwitch = () => {
    if (!pendingRole) {
      return;
    }

    setSessionMode(pendingRole === 'DRIVER' ? 'DRIVER' : 'BUYER');
    toast.success(
      pendingRole === 'DRIVER'
        ? 'Berhasil beralih ke mode Driver'
        : 'Berhasil beralih ke mode Pembeli'
    );
    setPendingRole(null);
    router.replace('/');
  };

  const username = store.username || user.username || user.email.split('@')[0];

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <div className="flex flex-col flex-1 px-5 pt-5">
        <Header profilePic={store.profilePic} />

        <div className="pt-5 pb-5">
          <ProfileCard
            name={store.name || user.name}
            username={username}
            email={store.email || user.email}
            profilePic={store.profilePic}
            role={store.role}
            isDriverVerified={store.isDriverVerified}
          />
        </div>

        <div className="pt-1 space-y-4">
          <ModeToggle
            currentRole={store.role}
            isDriverVerified={store.isDriverVerified}
            onToggle={handleToggle}
          />

          {!store.hasDriverAccount && (
            <DriverCTACard onClick={() => router.push('/profile/daftar-driver')} />
          )}

          {store.hasDriverAccount && !canUseDriverMode && (
            <DriverCTACard
              onClick={() => undefined}
              disabled
              title="Pendaftaran Driver Sedang Ditinjau"
              description="Pengajuan KTM dan QRIS kamu sudah masuk. Tunggu verifikasi admin untuk mengaktifkan mode Driver."
            />
          )}
        </div>

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
          onCancel={() => setPendingRole(null)}
        />
      )}
    </div>
  );
}
