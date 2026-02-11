import { Skeleton } from "@/components/ui/skeleton";

export default function TaskDetailLoading() {
  return (
    <div className="flex-1 flex justify-center">
      <div className="max-w-2xl w-full px-6 md:px-12 py-8">
        {/* Back link */}
        <Skeleton className="h-4 w-16 mb-6" />

        {/* Title */}
        <div className="mb-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <div className="flex items-center gap-3 mt-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Properties table */}
        <div className="border rounded-lg divide-y mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-2.5">
              <Skeleton className="h-4 w-32 shrink-0" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="mb-8">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>

        {/* Context */}
        <div className="mb-8">
          <Skeleton className="h-4 w-16 mb-3" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
