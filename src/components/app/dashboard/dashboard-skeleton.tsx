import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border/60 px-4 py-6 md:px-8">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="mb-2 h-7 w-80" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 px-4 py-6 md:grid-cols-4 md:px-8">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 px-4 pb-6 md:grid-cols-2 md:px-8">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
