import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      {/* Banner Skeleton */}
      <section className="space-y-5">
        <div className="grid gap-6 overflow-hidden md:grid-cols-2">
          {/* Story + CTA */}
          <div className="p-3">
            <Skeleton className="h-3 w-32" /> {/* Editor's Pick */}
            <Skeleton className="mt-4 h-10 w-[70%] sm:h-12" /> {/* Title */}
            <Skeleton className="mt-2 h-10 w-[55%] sm:h-12" /> {/* Title line 2 */}

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <Skeleton className="h-4 w-20" /> {/* 3 items */}
              
            </div>

            {/* Story paragraph */}
            <div className="mt-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[82%]" />
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Skeleton className="h-11 w-36 rounded-xl" />
              <Skeleton className="h-11 w-40 rounded-xl" />
            </div>
          </div>

          {/* Image */}
          <div className="bg-muted relative">
            <div className="relative h-[280px] w-full sm:h-[360px] md:h-full md:min-h-[420px]">
              <Skeleton className="absolute inset-0" />
            </div>
          </div>
        </div>
      </section>

      {/* Products Skeleton */}
      <section id="products" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <Skeleton className="h-6 w-60" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-6 p-6"
            >
              {/* NUMBER */}
              <Skeleton className="h-8 w-10" />

              {/* IMAGE */}
              <Skeleton className="h-24 w-24 rounded-xl" />

              {/* INFO */}
              <div className="flex flex-1 items-center justify-between gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>

                {/* PRICE */}
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
