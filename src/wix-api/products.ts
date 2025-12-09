import { WixClient } from "@/lib/wix-client.base";
import { cache } from "react";

export type ProductsSort = "last_updated" | "price_asc" | "price_desc";

interface QueryProductsFilter {
  q?: string;
  collectionIds?: string[] | string;
  sort?: ProductsSort;
  priceMin?: number;
  priceMax?: number;
  skip?: number;
  limit?: number;
}
// reusable function to query products

export async function queryProducts(
  wixClient: WixClient,
  {q, collectionIds, sort = "last_updated", priceMax, priceMin, skip, limit }: QueryProductsFilter,
) {
  // This is a query builder pattern query
  let query = wixClient.products.queryProducts();

  if(q){
    query = query.startsWith("name", q)
  }
  
  const collectionIdsArray = collectionIds
    ? Array.isArray(collectionIds)
      ? collectionIds
      : [collectionIds]
    : [];

  if (collectionIdsArray.length > 0) {
    query = query.hasSome("collectionIds", collectionIdsArray);
  }

  switch (sort) {
    case "price_asc":
      query = query.ascending("price");
      break;
    case "price_desc":
      query = query.descending("price");
      break;
    case "last_updated":
      query = query.descending("lastUpdated");
      break;
  }

  if (priceMin){
    query = query.ge("priceData.price", priceMin); // reassign query, greater than or equal to
  }
  if (priceMax){
    query = query.le("priceData.price", priceMax); // less than or equal to
  }
  if (limit) query = query.limit(limit); // reassign query with if  we pass limit 
  if (skip) query = query.skip(skip);

  return query.find(); // Execute the query and return the results
}

// purpose of cache function is to dedeuplicate the calls to this function with same argument(e.g. "slug/page.tsx")

export const getProductBySlug = cache(async (wixClient: WixClient, slug: string) => {
  
  const { items } = await wixClient.products
    .queryProducts() // this comes from wix client instance, builder pattern
    .eq("slug", slug)
    .limit(1) // Limit to 1 result since slug is unique
    .find(); // execute the query

  const product = items[0]; // Get the first item from the results
  if (!product || !product.visible) {
    return null;
  }
  return product;
});

{
  /*
  getProductBySlug with cache 
  Multiple calls with the same slug during a single request are resolved from memory, not refetched
  The cache function only works within the same request lifecycle (SSR/route handler).
  For longer-lived caching (ISR, tag-based revalidation), should use unstable_cache() instead.
  cache is usually enough to need to avoid duplicate fetches during rendering
  */
}
