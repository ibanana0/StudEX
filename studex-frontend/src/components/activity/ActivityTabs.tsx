'use client';

import type { ActivityTab } from '@/types';

// ── Activity Tab Switcher ────────────────────────────────────────────────────
// Two-tab selector: "Dalam Proses" (in-progress) / "Riwayat" (history).

interface ActivityTabsProps {
  activeTab: ActivityTab;
  onChange: (tab: ActivityTab) => void;
}

const tabs: { key: ActivityTab; label: string }[] = [
  { key: 'dalam-proses', label: 'Dalam Proses' },
  { key: 'riwayat',      label: 'Riwayat' },
];

export default function ActivityTabs({ activeTab, onChange }: ActivityTabsProps) {
  return (
    <div className="flex p-1 gap-0 rounded-lg bg-[#F0ECF9]">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 py-2 rounded-md text-xs font-semibold leading-4 text-center transition-all duration-150 ${
            activeTab === key
              ? 'bg-[#FCF8FF] text-primary shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]'
              : 'text-[#464555]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
