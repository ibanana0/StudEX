'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
  Shield,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/modal/ConfirmationModal';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import type { AccountStatus, Role } from '@/types';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  username: string | null;
  role: Role;
  accountStatus: AccountStatus;
  suspendedUntil: string | null;
  createdAt: string;
}

interface UsersResponse {
  message: string;
  data: AdminUser[];
}

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  DRIVER: 'bg-blue-100 text-blue-700',
  USER: 'bg-gray-100 text-gray-700',
};

const STATUS_BADGE: Record<AccountStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-amber-100 text-amber-700',
  BANNED: 'bg-red-100 text-red-700',
};

function formatSuspensionTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs <= 0) return 'Suspensi telah berakhir';

  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  return `Suspended: sisa ${diffHours} jam`;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AccountStatus>('ALL');

  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'ban' | 'active';
    userId: number;
    userName: string;
  } | null>(null);
  const [suspendHours, setSuspendHours] = useState('24');

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await api.get<UsersResponse>('/admin/users');
      return response.data.data;
    },
    enabled: Boolean(user && user.role === 'ADMIN'),
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
      durationHours,
    }: {
      userId: number;
      status: AccountStatus;
      durationHours?: number;
    }) => {
      await api.patch(`/admin/users/${userId}/status`, { status, durationHours });
    },
    onSuccess: (_, variables) => {
      const actionLabel = 
        variables.status === 'ACTIVE' 
          ? 'Akun diaktifkan' 
          : variables.status === 'SUSPENDED' 
            ? 'Akun di-suspend' 
            : 'Akun di-ban';
      toast.success(`${actionLabel} berhasil`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setConfirmAction(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal mengubah status akun');
    },
  });

  const isPending = statusMutation.isPending;

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { type, userId } = confirmAction;

    if (type === 'suspend') {
      const hours = parseInt(suspendHours, 10);
      if (isNaN(hours) || hours <= 0) {
        toast.error('Masukkan durasi suspend dalam jam yang valid');
        return;
      }
      statusMutation.mutate({ userId, status: 'SUSPENDED', durationHours: hours });
    } else if (type === 'ban') {
      statusMutation.mutate({ userId, status: 'BANNED' });
    } else if (type === 'active') {
      statusMutation.mutate({ userId, status: 'ACTIVE' });
    }
  };

  const users = usersQuery.data ?? [];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.accountStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getModalConfig = () => {
    if (!confirmAction) return { title: '', description: '', icon: CheckCircle, confirmLabel: '' };

    switch (confirmAction.type) {
      case 'suspend':
        return {
          title: 'Suspend Akun User?',
          description: `Tangguhkan sementara akun "${confirmAction.userName}". Tentukan durasi suspensi dalam satuan jam:`,
          icon: AlertTriangle,
          confirmLabel: 'Suspend Akun',
        };
      case 'ban':
        return {
          title: 'Ban Akun User Permanen?',
          description: `Blokir permanen akun "${confirmAction.userName}". User ini tidak akan bisa login selamanya.`,
          icon: Ban,
          confirmLabel: 'Ban Permanen',
        };
      case 'active':
        return {
          title: 'Aktifkan Kembali Akun?',
          description: `Pulihkan status akun "${confirmAction.userName}" menjadi aktif kembali agar dapat login dan bertransaksi.`,
          icon: UserCheck,
          confirmLabel: 'Aktifkan Akun',
        };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <div className="flex flex-1 flex-col px-5 pb-8 pt-5">
      {/* Banner */}
      <section className="mt-2 rounded-[32px] bg-gradient-to-r from-[#8E44AD] to-[#9B59B6] p-5 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-white/75">Admin Dashboard</p>
            <h1 className="mt-2 font-bitter text-3xl leading-tight">
              Kelola Pengguna
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/85">
              Kelola hak akses pengguna, lakukan suspend sementara, atau blokir permanen akun pelanggar.
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#8E44AD] shadow-sm">
            <Users className="h-7 w-7" />
          </div>
        </div>
      </section>

      {/* Search & Filter controls */}
      <div className="mt-5 bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, atau username..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 font-bitter block mb-1">Filter Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Role</option>
              <option value="USER">USER</option>
              <option value="DRIVER">DRIVER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 font-bitter block mb-1">Filter Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="BANNED">BANNED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Count & Refresh */}
      <div className="mt-5 flex items-center justify-between rounded-[24px] bg-white px-4 py-4 shadow-sm">
        <div>
          <p className="text-sm text-[#5F5A74]">Total pengguna terfilter</p>
          <p className="font-bitter text-2xl text-[#1B1B24]">{filteredUsers.length} pengguna</p>
        </div>
        <button
          type="button"
          onClick={() => usersQuery.refetch()}
          disabled={usersQuery.isFetching}
          className="flex items-center gap-2 rounded-2xl bg-purple-50 px-4 py-3 font-bitter font-semibold text-[#8E44AD] disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${usersQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Users List Cards */}
      <div className="mt-5 space-y-4">
        {usersQuery.isLoading ? (
          <div className="rounded-[28px] bg-white px-5 py-10 text-center shadow-sm">
            <p className="font-bitter text-lg text-[#5F5A74]">Memuat data pengguna...</p>
          </div>
        ) : null}

        {usersQuery.isError ? (
          <div className="rounded-[28px] bg-white px-5 py-10 text-center shadow-sm">
            <p className="font-bitter text-lg text-[#1B1B24]">Gagal memuat data</p>
            <p className="mt-2 text-sm leading-6 text-[#5F5A74]">
              Periksa koneksi backend atau coba refresh kembali.
            </p>
          </div>
        ) : null}

        {!usersQuery.isLoading && !usersQuery.isError && filteredUsers.length === 0 ? (
          <div className="rounded-[28px] bg-white px-5 py-10 text-center shadow-sm">
            <Shield className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h2 className="font-bitter text-xl text-[#1B1B24]">Tidak ada pengguna</h2>
            <p className="mt-1 text-xs text-[#5F5A74]">
              Tidak ada pengguna yang cocok dengan kriteria pencarian Anda.
            </p>
          </div>
        ) : null}

        {filteredUsers.map((u) => {
          const isCurrentUser = u.id === user?.id;
          return (
            <div key={u.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-sm text-[#1B1B24] truncate">{u.name}</h4>
                    {isCurrentUser && (
                      <span className="text-[9px] bg-purple-50 text-[#8E44AD] px-1.5 py-0.5 rounded font-bold font-bitter">
                        ANDA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">@{u.username || 'no-username'}</p>
                  <p className="text-xs text-[#5F5A74] truncate mt-0.5">{u.email}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role]}`}>
                  {u.role}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[u.accountStatus]}`}>
                  {u.accountStatus}
                </span>
                {u.accountStatus === 'SUSPENDED' && u.suspendedUntil && (
                  <span className="text-[9px] font-medium text-amber-600 truncate ml-auto bg-amber-50 px-2 py-0.5 rounded">
                    {formatSuspensionTime(u.suspendedUntil)}
                  </span>
                )}
              </div>

              {/* Actions */}
              {!isCurrentUser && (
                <div className="flex gap-2 pt-1 border-t border-gray-50">
                  {u.accountStatus === 'ACTIVE' ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmAction({
                            type: 'suspend',
                            userId: u.id,
                            userName: u.name,
                          })
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/70 text-amber-700 py-2.5 font-bitter text-xs font-semibold transition-colors"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Suspend
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmAction({
                            type: 'ban',
                            userId: u.id,
                            userName: u.name,
                          })
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-50 hover:bg-red-100/70 text-red-700 py-2.5 font-bitter text-xs font-semibold transition-colors"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Ban
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({
                          type: 'active',
                          userId: u.id,
                          userName: u.name,
                        })
                      }
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-green-50 hover:bg-green-100/70 text-green-700 py-2.5 font-bitter text-xs font-semibold transition-colors"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Aktifkan Kembali Akun
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmAction && (
        <ConfirmationModal
          isOpen={confirmAction !== null}
          onClose={() => !isPending && setConfirmAction(null)}
          onConfirm={handleConfirmAction}
          title={modalConfig.title}
          description={modalConfig.description}
          icon={modalConfig.icon}
          confirmLabel={modalConfig.confirmLabel}
          isLoading={isPending}
          hasInput={confirmAction?.type === 'suspend'}
          inputValue={suspendHours}
          onInputChange={setSuspendHours}
          inputPlaceholder="Masukkan durasi suspend (jam)"
        />
      )}
    </div>
  );
}
