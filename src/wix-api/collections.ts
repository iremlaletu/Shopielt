import { WixClient } from "@/lib/wix-client.base";
import { collections } from "@wix/stores";
import { cache } from "react";

export const getCollectionsBySlug = cache(
  async (wixClient: WixClient, slug: string) => {
    const { collection } =
      await wixClient.collections.getCollectionBySlug(slug);
    
      return collection || null;
  },
);

// fetch all collections
// cache the result to avoid multiple requests (in Navbar, in filter sidebar)

export const getCollections = cache(
  async (wixClient: WixClient): Promise<collections.Collection[]> => {
    // return multiple collections array
    const collection = await wixClient.collections
      .queryCollections()
      .ne("_id", "00000000-000000-000000-000000000001") // all products
      .ne("_id", "5d145db6-c06f-bde9-9059-b82a5d1f4c4b") // featured products
      .find();

    return collection.items;
  },
);
