import { Skeleton } from "@/components/ui/skeleton"

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'detail' | 'list';
  count?: number;
}

export function LoadingSkeleton({ type = 'card', count = 1 }: LoadingSkeletonProps) {
  const renderItem = (index: number) => {
    switch (type) {
      case 'card':
        return (
          <div key={index} className="flex flex-col space-y-3 p-4 border rounded-xl shadow-sm">
            <Skeleton className="h-40 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        );
      case 'table':
        return (
          <div key={index} className="flex items-center space-x-4 py-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        );
      case 'detail':
        return (
          <div key={index} className="space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        );
      case 'list':
      default:
        return (
          <div key={index} className="space-y-3 mb-6">
            <Skeleton className="h-6 w-[250px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        );
    }
  };

  return (
    <div className={type === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}>
      {Array.from({ length: count }).map((_, i) => renderItem(i))}
    </div>
  );
}
