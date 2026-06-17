'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/drivers');
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-[#FCFBFF]">
      <p className="font-bitter text-lg text-[#5F5A74]">Memuat dashboard admin...</p>
    </div>
  );
}
