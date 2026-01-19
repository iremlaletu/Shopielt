import { WIX_STORES_APP_ID } from "@/lib/constants";
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

// This function runs two weeks after a customer purchases a product. It sends a review request email
// and uses the ID to generate the Wix Studio URL.

export async function getProductById(wixClient: WixClient, productId: string) {
  const result = await wixClient.products.getProduct(productId);
  return result.product;
}

{
  /*
  getProductBySlug with cache 
  Multiple calls with the same slug during a single request are resolved from memory, not refetched
  The cache function only works within the same request lifecycle (SSR/route handler).
  For longer-lived caching (ISR, tag-based revalidation), should use unstable_cache() instead.
  cache is usually enough to need to avoid duplicate fetches during rendering
  */
}

export async function getRelatedProducts(
  wixClient: WixClient,
  productId: string,
) {
  const result = await wixClient.recommendations.getRecommendation(
    [
      {
        _id: "68ebce04-b96a-4c52-9329-08fc9d8c1253", // "From the same categories"
        appId: WIX_STORES_APP_ID,
      },
      {
        _id: "d5aac1e1-2e53-4d11-85f7-7172710b4783", // "Frequenly bought together"
        appId: WIX_STORES_APP_ID,
      },
    ],
    {
      items: [
        {
          appId: WIX_STORES_APP_ID,
          catalogItemId: productId,
        },
      ],
      minimumRecommendedItems: 2,
    },
  );

  const productIds = (result.recommendation?.items ?? [])
    .map((item) => item.catalogItemId)
    .filter((id) => id !== undefined);

  if (!productIds.length) return [];

  const productsResult = await wixClient.products
    .queryProducts()
    .in("_id", productIds)
    .limit(4)
    .find();

  return productsResult.items;
}

// Here, For exmp, 'From the same category' algorithm have only 2 products then we fallback to 'Frequently bought together' algorithm to fill the gap
