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
import { useMinLoadTime } from '@/hooks/useMinLoadTime';
import { Skeleton } from '@/components/ui/Skeleton';

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
    }
  }, [isLoading, needsProfileCompletion, router, user]);

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
    router.replace('/login');
  };

  if (!minLoadDone || isLoading || !user) {
    return (
      <div className="flex flex-1 flex-col px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <div className="rounded-2xl border border-gray-100 p-5 space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="h-16 w-full rounded-2xl mb-4" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="flex-1" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    );
  }

  if (canUseDriverMode && !sessionMode) {
    return (
      <div className="flex flex-1 flex-col px-5 pt-5">
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
    <>
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
    </>
  );
}
