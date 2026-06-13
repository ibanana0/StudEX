'use client';

import ActivityCard from './ActivityCard';

export interface ActivityItem {
  id: number;
  title: string;
  status: string;
  time: string;
  iconVariant?: 'check' | 'clock' | 'x';
}

interface RecentActivitiesProps {
  activities: ActivityItem[];
  onActivityClick?: (id: number) => void;
  onViewAll?: () => void;
}

export default function RecentActivities({
  activities,
  onActivityClick,
  onViewAll,
}: RecentActivitiesProps) {
  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#1A1A2E]">Aktivitas Terakhir</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Lihat Semua
          </button>
        )}
      </div>

      {/* Activity List */}
      {activities.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-[#8E8E9A]">Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {activities.map((item) => (
            <ActivityCard
              key={item.id}
              title={item.title}
              status={item.status}
              time={item.time}
              iconVariant={item.iconVariant}
              onClick={() => onActivityClick?.(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
