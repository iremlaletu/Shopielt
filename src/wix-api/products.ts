import { getWixClient } from "@/lib/wix-client.base";

export type ProductsSort = "last_updated" | "price_asc" | "price_desc";

interface QueryProductsFilter {
  collectionIds?: string[] | string;
  sort?: ProductsSort;
}
// reusable function to query products

export default async function queryProducts({
  collectionIds,
  sort = "last_updated",
}: QueryProductsFilter) {
  const wixClient = getWixClient();

  // This is a query builder pattern query 
  let query = wixClient.products.queryProducts();

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

  return query.find(); // Execute the query and return the results
}


export async function getProductBySlug (slug: string ){
  const wixClient = getWixClient();
  const {items} = await wixClient.products.queryProducts() // this comes from wix client instance, builder pattern
  .eq("slug", slug)
  .limit(1) // Limit to 1 result since slug is unique
  .find(); // execute the query

  const product = items[0]; // Get the first item from the results
  if(!product || !product.visible){
    return null;
  }
  return product;
}