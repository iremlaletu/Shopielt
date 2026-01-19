import CheckoutPageClient from "./CheckoutPageClient";
import { getWixServerClient } from "@/lib/wix-client.server";
import { getCart } from "@/wix-api/cart";

export default async function Page() {
  const wixClient = await getWixServerClient();

  // initial cart (server)
  const initialData = await getCart(wixClient);
  return <CheckoutPageClient initialData={initialData} />;
}

