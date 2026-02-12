import { WixClient } from "@/lib/wix-client.base";
import { cache } from "react";

export type EditorsPickItem = {
  _id: string;
  slug: string;
  title_fld?: string;
  description_fld?: string; // HTML geliyor use dangerouslySetInnerHTML ile render edilmeli
  image_fld?: string; // wix:image://... WixImage formatında geliyor
  imagealttext_fld?: string;
};

export type EditorsPickProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  formattedPrice?: string;
  discountedPrice?: number;
  formattedDiscountedPrice?: string;
  mainMedia?: string;
  mediaItems?: Array<{ src?: string; type?: string; title?: string }>;
  ribbon?: string;
  inStock?: boolean;
};


export const getEditorsPicks = cache(async (wixClient: WixClient) => {
  const result = await wixClient.items.query("APicks").find();

  return (result.items ?? []) as EditorsPickItem[];
});

export const getEditorsPickBySlug = cache(
  async (wixClient: WixClient, slug: string) => {
    const result = await wixClient.items
      .query("APicks")
      .eq("slug", slug)
      .find();

    return (result.items?.[0] ?? null) as EditorsPickItem | null;
  },
);

/**
 * Multi-reference resolve:
 * pick item -> queryReferenced(pickId, "multireference") -> returns referenced items from Products collection
 * 
 */

export const getEditorsPickProducts = cache(
  async (wixClient: WixClient, pickId: string) => {
    // SDK’da queryReferenced direkt Promise dönüyor (find olmaz)
    const res = await wixClient.items.queryReferenced(
      "APicks",
      pickId,
      "multireference",
    );

   return (res.items ?? []) as EditorsPickProduct[];
  },
);

export const getEditorsPickWithProductsBySlug = cache(
  async (wixClient: WixClient, slug: string) => {
    const pick = await getEditorsPickBySlug(wixClient, slug);
    if (!pick?._id) return null;

    const products = await getEditorsPickProducts(wixClient, pick._id);
    return { pick, products };
  },
);
