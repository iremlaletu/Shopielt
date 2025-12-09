import PaginationBar from "@/components/PaginationBar";
import Product from "@/components/Product";
import ProductSkeleton from "@/components/ProductSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { delay } from "@/lib/utils";
import { getWixServerClient } from "@/lib/wix-client.server";
import { ProductsSort, queryProducts } from "@/wix-api/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    collection?: string[];
    price_min?: string;
    price_max?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;

  return {
    title: q ? `Results for "${q}"` : "Products",
  };
}

export default async function Page({ searchParams }: PageProps) {
  const {
    q,
    page = "1",
    collection: collectionIds,
    price_max,
    price_min,
    sort
  } = await searchParams;
  const title = q ? `Results for "${q}"` : "Products";

  return (
    <div className="space-y-10">
      <h1 className="text-center text-3xl font-bold">{title}</h1>
      <Suspense fallback={<LoadingSkeleton />} key={`${q}-${page}`}>
        <ProductResults
          q={q}
          page={parseInt(page)}
          collectionIds={collectionIds}
          priceMin={price_min ? parseInt(price_min) : undefined}
          priceMax={price_max ? parseInt(price_max) : undefined}
          sort={sort as ProductsSort}
        />
      </Suspense>
    </div>
  );
}

interface ProductResultsProps {
  q?: string;
  page: number;
  collectionIds?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: ProductsSort;
}

async function ProductResults({ q, page, collectionIds, priceMax, priceMin, sort }: ProductResultsProps) {
  await delay(2000);
  const pageSize = 8;

  const products = await queryProducts(await getWixServerClient(), {
    q,
    limit: pageSize,
    skip: (page - 1) * pageSize,
    collectionIds,
    priceMax,
    priceMin,
    sort
  });

  if (page > (products.totalPages || 1)) notFound();

  // show "Displaying x-y of z products"?
  const totalCount = products.totalCount ?? 0;
  const currentCount = products.items.length;
  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + currentCount;

  return (
    <div className="pending-animate space-y-10">
      <p className="text-muted-foreground text-center text-xl">
        {totalCount === 0 ? (
          <>No products found</>
        ) : (
          <>
            Showing <span className="font-semibold">{startIndex}</span>–
            <span className="font-semibold">{endIndex}</span> of{" "}
            <span className="font-semibold">{totalCount}</span>{" "}
            {totalCount === 1 ? "product" : "products"}
          </>
        )}
      </p>
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid xl:grid-cols-3 2xl:grid-cols-4">
        {products.items.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
      <PaginationBar currentPage={page} totalPages={products.totalPages || 1} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="mx-auto h-9 w-52" />
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

{
  /* "data-pending={isPending ? "" : undefined}" from searchfilterlayout 
    if its pending is true, we put this data pending value into the sidebar
    then page.tsx file here will listen for this and apply this: "group-has-[[data-pending]]:animate-pulse"  */
}
