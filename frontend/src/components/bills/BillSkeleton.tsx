function Shimmer({ className = "" }: { className?: string }) {
    return (
      <div
        className={`animate-pulse rounded-lg bg-muted/40 ${className}`}
      />
    );
  }
  
  export function BillCardSkeleton() {
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
        <Shimmer className="aspect-[4/3] w-full rounded-none" />
        <div className="space-y-2.5 p-4">
          <Shimmer className="h-3.5 w-3/4" />
          <Shimmer className="h-3 w-1/2" />
          <div className="flex items-center gap-2 pt-1">
            <Shimmer className="h-5 w-12 rounded-full" />
            <Shimmer className="h-4 w-10" />
          </div>
        </div>
      </div>
    );
  }
  
  export function BillRowSkeleton() {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border/40 bg-card px-4 py-3">
        <Shimmer className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3.5 w-2/5" />
          <Shimmer className="h-3 w-1/4" />
        </div>
        <Shimmer className="h-5 w-14 rounded-full" />
        <Shimmer className="h-8 w-8 rounded-lg" />
        <Shimmer className="h-8 w-8 rounded-lg" />
      </div>
    );
  }
  
  export function BillSkeletonGrid({ count = 6 }: { count?: number }) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <BillCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  export function BillSkeletonList({ count = 5 }: { count?: number }) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <BillRowSkeleton key={i} />
        ))}
      </div>
    );
  }