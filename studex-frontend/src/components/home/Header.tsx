'use client';

import Image from 'next/image';
import StudexLogo from '../../../public/studex-logo.png';

interface HeaderProps {
  profilePic?: string;
  onProfileClick?: () => void;
}

export default function Header({ profilePic, onProfileClick }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {/* StudEx Logo */}
      <div className="flex items-center">
        <Image
          src={StudexLogo}
          alt="StudEx Logo"
          width={48}      
          priority
        />
      </div>

      {/* Profile Picture */}
      <button
        onClick={onProfileClick}
        className="w-10 h-10 overflow-hidden rounded-full bg-muted shrink-0"
      >
        {profilePic ? (
          <Image
            src={profilePic}
            alt="Profile"
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">
            U
          </div>
        )}
      </button>
    </div>
  );
}
