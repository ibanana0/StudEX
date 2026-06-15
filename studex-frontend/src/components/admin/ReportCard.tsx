'use client';

import { AlertTriangle, Ban, CheckCircle, Eye, Flag, Mail, ShoppingBag, XCircle } from 'lucide-react';
import type { Report } from '@/types';

interface ReportCardProps {
  report: Report;
  isResolving: boolean;
  isDismissing: boolean;
  isSuspending: boolean;
  isBanning: boolean;
  onResolve: () => void;
  onDismiss: () => void;
  onSuspend: () => void;
  onBan: () => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  INVESTIGATING: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  DISMISSED: 'bg-gray-100 text-gray-500',
};

export default function ReportCard({
  report,
  isResolving,
  isDismissing,
  isSuspending,
  isBanning,
  onResolve,
  onDismiss,
  onSuspend,
  onBan,
}: ReportCardProps) {
  const isActionDisabled = isResolving || isDismissing || isSuspending || isBanning;

  return (
    <article className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header: Reporter info */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-red-50 text-red-500">
          <Flag className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bitter text-lg text-[#1B1B24] truncate">
              {report.reported.name}
            </h3>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[report.status] ?? ''}`}>
              {report.status}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#5F5A74]">
            Dilaporkan oleh <b>{report.reporter.name}</b> &middot; {formatDate(report.createdAt)}
          </p>
        </div>
      </div>

      {/* Reason & Details */}
      <div className="mt-4 rounded-2xl bg-[#FFF5F5] p-4 space-y-2">
        <p className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4" />
          {report.reason}
        </p>
        <p className="text-sm text-[#5F5A74] leading-relaxed">{report.details}</p>
      </div>

      {/* Order reference */}
      {report.order && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#F8F7FD] px-4 py-3 text-sm text-[#5F5A74]">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <span className="truncate">
            {report.order.shopName} &middot; #{report.order.id}
          </span>
        </div>
      )}

      {/* Reported user info */}
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#F8F7FD] px-4 py-3 text-sm text-[#5F5A74]">
        <Mail className="h-4 w-4 text-primary" />
        <span className="truncate">{report.reported.email}</span>
        {report.reported.accountStatus && report.reported.accountStatus !== 'ACTIVE' && (
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
            {report.reported.accountStatus}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onDismiss}
          disabled={isActionDisabled}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3 font-bitter text-sm font-semibold text-[#5F5A74] disabled:opacity-60"
        >
          <XCircle className="h-4 w-4" />
          {isDismissing ? 'Mengabaikan...' : 'Abaikan'}
        </button>
        <button
          type="button"
          onClick={onResolve}
          disabled={isActionDisabled}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-3 font-bitter text-sm font-semibold text-white disabled:opacity-60"
        >
          <CheckCircle className="h-4 w-4" />
          {isResolving ? 'Memproses...' : 'Tindak Lanjuti'}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onSuspend}
          disabled={isActionDisabled}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-amber-50 px-4 py-3 font-bitter text-sm font-semibold text-amber-600 disabled:opacity-60"
        >
          <Eye className="h-4 w-4" />
          {isSuspending ? 'Suspend...' : 'Suspend'}
        </button>
        <button
          type="button"
          onClick={onBan}
          disabled={isActionDisabled}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#FDEDED] px-4 py-3 font-bitter text-sm font-semibold text-[#C0392B] disabled:opacity-60"
        >
          <Ban className="h-4 w-4" />
          {isBanning ? 'Ban...' : 'Ban'}
        </button>
      </div>
    </article>
  );
}
