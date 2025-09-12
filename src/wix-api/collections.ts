import { getWixClient, WixClient } from "@/lib/wix-client.base";

export default async function getCollectionsBySlug(
  wixClient: WixClient,
  slug: string,
) {
  const { collection } = await wixClient.collections.getCollectionBySlug(slug);
  return collection || null;
}
