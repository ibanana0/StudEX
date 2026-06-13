'use client';

import Image from 'next/image';
import { User, GraduationCap } from 'lucide-react';
import type { Role } from '@/types/user';

interface ProfileCardProps {
  name: string;
  username: string;
  email: string;
  profilePic?: string;
  role: Role;
  isDriverVerified: boolean;
}

export default function ProfileCard({
  name,
  username,
  email,
  profilePic,
  role,
  isDriverVerified,
}: ProfileCardProps) {
  const badgeLabel =
    role === 'DRIVER'
      ? isDriverVerified
        ? 'Driver Aktif'
        : 'Driver (Menunggu)'
      : 'Pembeli Aktif';

  return (
    <div className="border border-gray-200 rounded-2xl px-5 pt-6 pb-5 flex flex-col items-center text-center gap-2">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center mb-1 shrink-0">
        {profilePic ? (
          <Image
            src={profilePic}
            alt={name}
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        ) : (
          <User className="w-10 h-10 text-primary/60" strokeWidth={1.5} />
        )}
      </div>

      {/* Name */}
      <h2 className="text-2xl font-semibold font-bitter text-[#1B1B24] leading-tight">
        {name}
      </h2>

      {/* Username */}
      <p className="text-sm text-muted-foreground">{username}</p>

      {/* Email */}
      <p className="text-sm text-muted-foreground">{email}</p>

      {/* Role Badge */}
      <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold font-bitter rounded-full px-3.5 py-1.5 mt-1">
        <GraduationCap className="w-3.5 h-3.5" />
        {badgeLabel}
      </span>
    </div>
  );
}
