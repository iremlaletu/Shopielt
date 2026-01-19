import ProductSkeleton from "@/components/ProductSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import WixImage from "@/components/WixImage";
import { cn, delay } from "@/lib/utils";
import { getWixServerClient } from "@/lib/wix-client.server";
import { getCollectionsBySlug } from "@/wix-api/collections";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default function Layout(props: LayoutProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CollectionsLayout {...props} />
    </Suspense>
  );
}

async function CollectionsLayout(props: LayoutProps) {
  await delay(1000);
  const { children } = props;
  const { slug } = await props.params;
  const collection = await getCollectionsBySlug(
    await getWixServerClient(),
    slug,
  );

  if (!collection) notFound();

  const banner = collection.media?.mainMedia?.image;

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <div className="flex flex-col gap-10">
        {banner && (
          <div className="relative hidden sm:block w-full aspect-[1280/400] max-h-[400px]">
            <WixImage
              mediaIdentifier={banner.url}
              width={1280}
              height={400}
              alt={banner.altText}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
            <h1 className="absolute bottom-10 left-1/2 -translate-x-1/2 text-4xl font-bold text-white lg:text-5xl">
              {collection.name}
            </h1>
          </div>
        )}
        <h1
          className={cn(
            "mx-auto text-3xl font-bold md:text-4xl",
            banner && "sm:hidden",
          )}
        >
          {collection.name}
        </h1>
      </div>
      {children}
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <Skeleton className="mx-auto h-10 w-48 sm:block sm:aspect-[1280/400] sm:h-full sm:w-full" />
      <div className="space-y-5">
        <div className="flex grid-cols-2 flex-col gap-5 sm:grid md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
