'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Flag, LogOut, RefreshCw, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ReportCard } from '@/components/admin';
import { Header } from '@/components/home';
import { useAuth } from '@/context/AuthContext';
import type { Report } from '@/types';
import api from '@/utils/api';

interface PendingReportsResponse {
  message: string;
  data: Report[];
}

export default function AdminReportsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.replace('/profile');
    }
  }, [isLoading, router, user]);

  const reportsQuery = useQuery({
    queryKey: ['admin', 'pending-reports'],
    queryFn: async () => {
      const response = await api.get<PendingReportsResponse>('/admin/reports');
      return response.data.data;
    },
    enabled: Boolean(user && user.role === 'ADMIN'),
  });

  const resolveMutation = useMutation({
    mutationFn: async (reportId: number) => {
      await api.patch(`/admin/reports/${reportId}`, { status: 'RESOLVED' });
    },
    onSuccess: () => {
      toast.success('Laporan ditindaklanjuti');
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-reports'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal memperbarui laporan');
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (reportId: number) => {
      await api.patch(`/admin/reports/${reportId}`, { status: 'DISMISSED' });
    },
    onSuccess: () => {
      toast.success('Laporan diabaikan');
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-reports'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal mengabaikan laporan');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.patch(`/admin/users/${userId}/status`, { status: 'SUSPENDED' });
    },
    onSuccess: () => {
      toast.success('Akun user di-suspend');
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-reports'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal men-suspend akun');
    },
  });

  const banMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.patch(`/admin/users/${userId}/status`, { status: 'BANNED' });
    },
    onSuccess: () => {
      toast.success('Akun user di-ban');
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-reports'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal men-ban akun');
    },
  });

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-bitter text-lg text-[#5F5A74]">Memuat dashboard admin...</p>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return null;
  }

  const reports = reportsQuery.data ?? [];

  return (
    <div className="flex flex-1 flex-col bg-[#FCFBFF]">
      <div className="flex flex-1 flex-col px-5 pb-8 pt-5">
        <Header profilePic={user.profilePic} />

        <section className="mt-6 rounded-[32px] bg-gradient-to-r from-[#C0392B] to-[#E74C3C] p-5 text-white shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/75">Admin Dashboard</p>
              <h1 className="mt-2 font-bitter text-3xl leading-tight">
                Laporan Pelanggaran
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Tinjau laporan dari pembeli/driver dan ambil tindakan disipliner terhadap akun yang melanggar.
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#C0392B] shadow-sm">
              <ShieldAlert className="h-7 w-7" />
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between rounded-[24px] bg-white px-4 py-4 shadow-sm">
          <div>
            <p className="text-sm text-[#5F5A74]">Laporan pending</p>
            <p className="font-bitter text-2xl text-[#1B1B24]">{reports.length} laporan</p>
          </div>
          <button
            type="button"
            onClick={() => reportsQuery.refetch()}
            disabled={reportsQuery.isFetching}
            className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 font-bitter font-semibold text-red-500 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${reportsQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {reportsQuery.isLoading ? (
            <div className="rounded-[28px] bg-white px-5 py-10 text-center shadow-sm">
              <p className="font-bitter text-lg text-[#5F5A74]">Memuat laporan...</p>
            </div>
          ) : null}

          {reportsQuery.isError ? (
            <div className="rounded-[28px] bg-white px-5 py-10 text-center shadow-sm">
              <p className="font-bitter text-lg text-[#1B1B24]">Gagal memuat data</p>
              <p className="mt-2 text-sm leading-6 text-[#5F5A74]">
                Periksa koneksi backend atau login admin kamu, lalu coba refresh lagi.
              </p>
            </div>
          ) : null}

          {!reportsQuery.isLoading && !reportsQuery.isError && reports.length === 0 ? (
            <div className="rounded-[28px] bg-white px-5 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
                <Flag className="h-7 w-7" />
              </div>
              <h2 className="mt-5 font-bitter text-2xl text-[#1B1B24]">Tidak ada laporan</h2>
              <p className="mt-2 text-sm leading-6 text-[#5F5A74]">
                Semua laporan sudah ditinjau dan ditindaklanjuti.
              </p>
            </div>
          ) : null}

          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              isResolving={resolveMutation.isPending && resolveMutation.variables === report.id}
              isDismissing={dismissMutation.isPending && dismissMutation.variables === report.id}
              isSuspending={suspendMutation.isPending && suspendMutation.variables === report.reportedId}
              isBanning={banMutation.isPending && banMutation.variables === report.reportedId}
              onResolve={() => resolveMutation.mutate(report.id)}
              onDismiss={() => dismissMutation.mutate(report.id)}
              onSuspend={() => suspendMutation.mutate(report.reportedId)}
              onBan={() => banMutation.mutate(report.reportedId)}
            />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/drivers')}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary/10 py-4 font-bitter text-base font-semibold text-primary"
          >
            Lihat Driver
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              toast.success('Berhasil keluar dari dashboard admin');
              router.replace('/login');
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#FDEDED] py-4 font-bitter text-base font-semibold text-[#C0392B]"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
