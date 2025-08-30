import HeroCarousel from "@/components/HeroCarousel";
import Product from "@/components/Product";
import ProductSkeleton from "@/components/ProductSkeleton";
import { delay } from "@/lib/utils";
import { getWixClient } from "@/lib/wix-client.base";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-2 py-8">
      <HeroCarousel />
      <Suspense fallback={<FeaturedProductsFallback/>}>
        <FeaturedProducts />
      </Suspense>
    </main>
  );
}

async function FeaturedProducts() {
  await delay(3000);

  const wixClient = getWixClient();
  const { collection } =
    await wixClient.collections.getCollectionBySlug("featured");
  if (!collection?._id) {
    return null;
  }
  const featuredProducts = await wixClient.products
    .queryProducts()
    .hasSome("collectionIds", [collection._id])
    .descending("lastUpdated")
    .find();

  if (!featuredProducts.items.length) return null;
  return (
    <div className="space-y-5">
      
      <div className="flex flex-col gap-5 grid-cols-2 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {featuredProducts.items.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
      <pre>
        {JSON.stringify(featuredProducts.items, null, 2)}
      </pre>
    </div>
  );
}

function FeaturedProductsFallback() {
  return (
    <div className="space-y-5">
      
      <div className="flex flex-col gap-5 grid-cols-2 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
