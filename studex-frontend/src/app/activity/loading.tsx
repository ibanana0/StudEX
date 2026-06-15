import { Skeleton } from '@/components/ui/Skeleton';

export default function ActivityLoading() {
  return (
    <main className="flex-1 px-5 pt-5 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      <Skeleton className="h-7 w-48" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 p-4 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
        <Skeleton className="h-4 w-20 mt-2" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 p-4 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </main>
  );
}
