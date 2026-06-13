'use client';

import { BadgeCheck, Ban, ExternalLink, Mail, Phone } from 'lucide-react';
import type { PendingDriverApplication } from '@/types';

interface PendingDriverCardProps {
  application: PendingDriverApplication;
  isVerifying: boolean;
  isRejecting: boolean;
  onVerify: () => void;
  onReject: () => void;
}

function formatSubmittedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Tanggal tidak tersedia';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function PendingDriverCard({
  application,
  isVerifying,
  isRejecting,
  onVerify,
  onReject,
}: PendingDriverCardProps) {
  const { user } = application;

  return (
    <article className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
          {user.profilePic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profilePic}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-bitter text-lg font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-bitter text-xl text-[#1B1B24]">{user.name}</h2>
          <p className="mt-1 text-sm text-[#5F5A74]">
            Diajukan pada {formatSubmittedAt(application.submittedAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-2xl bg-[#F8F7FD] p-4 text-sm text-[#5F5A74]">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <span>{user.phoneNumber || 'Nomor telepon belum diisi'}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <a
          href={application.ktmUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary"
        >
          <span className="flex items-center justify-center gap-2">
            KTM
            <ExternalLink className="h-4 w-4" />
          </span>
        </a>
        <a
          href={application.qrisUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary"
        >
          <span className="flex items-center justify-center gap-2">
            QRIS
            <ExternalLink className="h-4 w-4" />
          </span>
        </a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onReject}
          disabled={isVerifying || isRejecting}
          className="rounded-2xl bg-[#FDEDED] px-4 py-3.5 font-bitter font-semibold text-[#C0392B] disabled:opacity-60"
        >
          <span className="flex items-center justify-center gap-2">
            <Ban className="h-4 w-4" />
            {isRejecting ? 'Menolak...' : 'Reject'}
          </span>
        </button>
        <button
          type="button"
          onClick={onVerify}
          disabled={isVerifying || isRejecting}
          className="rounded-2xl bg-primary px-4 py-3.5 font-bitter font-semibold text-white disabled:opacity-60"
        >
          <span className="flex items-center justify-center gap-2">
            <BadgeCheck className="h-4 w-4" />
            {isVerifying ? 'Approve...' : 'Approve'}
          </span>
        </button>
      </div>
    </article>
  );
}
