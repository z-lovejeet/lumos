import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Page Header Skeleton */}
      <div className="flex items-center justify-between space-y-2">
        <div className="space-y-2 w-full max-w-md">
          <Skeleton className="h-9 w-[250px]" />
          <Skeleton className="h-4 w-[350px] max-w-full" />
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </div>

      {/* Top Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-[80px]" />
            <Skeleton className="h-3 w-[140px]" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card shadow-sm lg:col-span-4 p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
        
        <div className="rounded-xl border bg-card shadow-sm lg:col-span-3 p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
