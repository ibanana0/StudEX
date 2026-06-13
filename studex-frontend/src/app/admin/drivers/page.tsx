'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PendingDriverCard } from '@/components/admin';
import { Header } from '@/components/home';
import { useAuth } from '@/context/AuthContext';
import type { PendingDriverApplication } from '@/types';
import api from '@/utils/api';

interface PendingDriversResponse {
  message: string;
  data: PendingDriverApplication[];
}

export default function AdminDriversPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      router.replace('/profile');
    }
  }, [isLoading, router, user]);

  const pendingDriversQuery = useQuery({
    queryKey: ['admin', 'pending-drivers'],
    queryFn: async () => {
      const response = await api.get<PendingDriversResponse>('/admin/drivers/pending');
      return response.data.data;
    },
    enabled: Boolean(user && user.role === 'ADMIN'),
  });

  const verifyMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.patch(`/admin/drivers/${userId}/verify`);
    },
    onSuccess: () => {
      toast.success('Driver berhasil diverifikasi');
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-drivers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal memverifikasi driver');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/admin/drivers/${userId}/reject`);
    },
    onSuccess: () => {
      toast.success('Pendaftaran driver ditolak');
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-drivers'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal menolak pendaftaran driver');
    },
  });

  if (isLoading || !user) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[430px] items-center justify-center bg-white">
        <p className="font-bitter text-lg text-[#5F5A74]">Memuat dashboard admin...</p>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return null;
  }

  const pendingDrivers = pendingDriversQuery.data ?? [];

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#FCFBFF]">
      <div className="flex flex-1 flex-col px-5 pb-8 pt-5">
        <Header profilePic={user.profilePic} />

        <section className="mt-6 rounded-[32px] bg-gradient-to-r from-[#2B1CCF] to-[#4731E6] p-5 text-white shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/75">Admin Dashboard</p>
              <h1 className="mt-2 font-bitter text-3xl leading-tight">
                Verifikasi Driver StudEx
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Tinjau pengajuan driver yang masuk dan putuskan approval langsung dari layar mobile.
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#2B1CCF] shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between rounded-[24px] bg-white px-4 py-4 shadow-sm">
          <div>
            <p className="text-sm text-[#5F5A74]">Pending saat ini</p>
            <p className="font-bitter text-2xl text-[#1B1B24]">{pendingDrivers.length} aplikasi</p>
          </div>
          <button
            type="button"
            onClick={() => pendingDriversQuery.refetch()}
            disabled={pendingDriversQuery.isFetching}
            className="flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 font-bitter font-semibold text-primary disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${pendingDriversQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {pendingDriversQuery.isLoading ? (
            <div className="rounded-[28px] bg-white px-5 py-10 text-center shadow-sm">
              <p className="font-bitter text-lg text-[#5F5A74]">Memuat pengajuan driver...</p>
            </div>
          ) : null}

          {pendingDriversQuery.isError ? (
            <div className="rounded-[28px] bg-white px-5 py-10 text-center shadow-sm">
              <p className="font-bitter text-lg text-[#1B1B24]">Gagal memuat data</p>
              <p className="mt-2 text-sm leading-6 text-[#5F5A74]">
                Periksa koneksi backend atau login admin kamu, lalu coba refresh lagi.
              </p>
            </div>
          ) : null}

          {!pendingDriversQuery.isLoading && !pendingDriversQuery.isError && pendingDrivers.length === 0 ? (
            <div className="rounded-[28px] bg-white px-5 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BadgeCheck className="h-7 w-7" />
              </div>
              <h2 className="mt-5 font-bitter text-2xl text-[#1B1B24]">Semua sudah tertinjau</h2>
              <p className="mt-2 text-sm leading-6 text-[#5F5A74]">
                Tidak ada pengajuan driver pending saat ini.
              </p>
            </div>
          ) : null}

          {pendingDrivers.map((application) => (
            <PendingDriverCard
              key={application.id}
              application={application}
              isVerifying={verifyMutation.isPending && verifyMutation.variables === application.userId}
              isRejecting={rejectMutation.isPending && rejectMutation.variables === application.userId}
              onVerify={() => verifyMutation.mutate(application.userId)}
              onReject={() => rejectMutation.mutate(application.userId)}
            />
          ))}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              logout();
              toast.success('Berhasil keluar dari dashboard admin');
              router.replace('/login');
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FDEDED] py-4 font-bitter text-base font-semibold text-[#C0392B]"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
