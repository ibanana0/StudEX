'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, ClipboardList, User } from 'lucide-react';

// ── Route map ────────────────────────────────────────────────────────────────
const navItems = [
  { path: '/',         label: 'Beranda',   icon: Home },
  { path: '/activity', label: 'Aktivitas', icon: ClipboardList },
  { path: '/profile',  label: 'Profil',    icon: User },
] as const;

export type NavTab = (typeof navItems)[number]['path'];

// ── Component ────────────────────────────────────────────────────────────────

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F5] z-20">
      <div className="flex items-center justify-around w-full max-w-[430px] mx-auto px-4 py-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive =
            path === '/' ? pathname === '/' : pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="flex flex-col items-center gap-1 min-w-0 flex-1 py-1 transition-colors"
            >
              <Icon
                className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-[#A0A0B0]'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[11px] leading-none ${
                  isActive ? 'text-primary font-semibold' : 'text-[#A0A0B0] font-normal'
                }`}
              >
                {label}
              </span>
              {/* Active dot indicator */}
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
