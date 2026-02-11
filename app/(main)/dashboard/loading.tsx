import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-dvh">
      <div className="flex flex-col flex-1 min-h-0 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-3 border-b">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>

        {/* Quick add */}
        <div className="px-6 md:px-12 lg:px-20 py-3 border-b">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-6 md:px-12 lg:px-20 py-2 border-b">
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>

        {/* Task rows */}
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-6 md:px-12 lg:px-20 py-3">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
