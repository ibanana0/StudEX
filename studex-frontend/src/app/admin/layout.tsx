'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, Flag, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import StudexLogo from '../../../public/studex-logo.png';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-[#FCFBFF]">
        <p className="font-bitter text-lg text-[#5F5A74]">Memuat dashboard admin...</p>
      </div>
    );
  }

  const navItems = [
    { label: 'Driver', path: '/admin/drivers', icon: ShieldCheck },
    { label: 'Laporan', path: '/admin/reports', icon: Flag },
    { label: 'User', path: '/admin/users', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Keluar dari dashboard admin');
    router.replace('/login');
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#FCFBFF] pb-20">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-5 py-3 shadow-sm flex items-center justify-between">
        <Image src={StudexLogo} alt="StudEx Logo" width={68} priority />
        <button
          onClick={handleLogout}
          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Keluar"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Admin Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white border-t border-gray-100 px-6 py-2 shadow-lg flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold font-bitter">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
