import { Skeleton } from "./ui/skeleton";

export default function ProductSkeleton() {
  return (
    <div className="bg-card h-full overflow-hidden rounded-md border">
      <div className="relative overflow-hidden">
        <Skeleton className="h-[300px] w-full" />

        <div className="absolute bottom-3 right-3 flex flex-wrap items-center gap-2 p-3">
          <Skeleton className="h-3 w-14 rounded bg-sidebar-ring" />
          <Skeleton className="h-3 w-10 rounded bg-sidebar-ring" />
        </div>
      </div>

      <div className="space-y-3 p-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-8 w-full" />
        
      </div>
    </div>
  );
}
