'use client';

import Image from 'next/image';
import { User } from 'lucide-react';
import StudexLogo from '../../../public/studex-logo.png';

export default function AuthHeader() {
  return (
    <div className="flex items-center justify-between">
      <Image src={StudexLogo} alt="StudEx Logo" width={52} priority />
      <button
        type="button"
        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white"
      >
        <User className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
      </button>
    </div>
  );
}
