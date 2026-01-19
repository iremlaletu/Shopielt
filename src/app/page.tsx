import HeroCarousel from "@/components/HeroCarousel";
import Product from "@/components/Product";
import ProductSkeleton from "@/components/ProductSkeleton";
import { getWixServerClient } from "@/lib/wix-client.server";
import { getCollectionsBySlug} from "@/wix-api/collections";
import { queryProducts } from "@/wix-api/products";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="mx-auto max-w-[90rem] space-y-10 px-2 py-8">
      <HeroCarousel />
      <Suspense fallback={<FeaturedProductsFallback/>}>
        <FeaturedProducts />
      </Suspense>
    </main>
  );
}

// getCollectionsBySlug and queryProducts are from wix-api folder which use wix-client.base.ts to get the wix client instance and fetch the actual data over there.
// I put sepereate files for each api call to keep the code clean and easy to reuse with slug.

async function FeaturedProducts() {
  
  const wixClient = await getWixServerClient()

  const collection = await getCollectionsBySlug( wixClient, "featured");

  if (!collection?._id) {
    return null;
  }

  // reuse the queryProducts function from wix-api/products.ts, passing the collection id to get the products in that collection.
  // queryProducts will be reused in other places with different params. For here I need to get products in the "featured" collection.
  const featuredProducts = await queryProducts(wixClient, {collectionIds: collection._id}); 

  if (!featuredProducts.items.length) return null;
  return (
    <div className="space-y-5"> 
      <div className="flex flex-col gap-5 grid-cols-2 sm:grid md:grid-cols-3 lg:grid-cols-5">
        {featuredProducts.items.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
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
