import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfileLoading() {
  return (
    <div className="flex flex-1 flex-col px-5 pt-5 pb-4">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      <div className="rounded-2xl border border-gray-100 p-5 space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-2xl mb-4" />
      <Skeleton className="h-16 w-full rounded-2xl mb-4" />
      <div className="flex-1" />
      <Skeleton className="h-14 w-full rounded-2xl" />
    </div>
  );
}
