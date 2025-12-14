import { wixBrowserClient } from "@/lib/wix-client.browser";
import { getCheckoutUrlForCurrentCart } from "@/wix-api/checkout";
import { useState } from "react";
import { toast } from "sonner";

export function useCartCheckout() {
  const [pending, setPending] = useState(false);

  async function startCheckoutFlow() {
    setPending(true);

    try {
      const checkoutUrl = await getCheckoutUrlForCurrentCart(wixBrowserClient);
      if (!checkoutUrl) {
        toast("Unable to generate checkout URL. Please try again.");
        setPending(false);
        return;
      }
      window.location.href = checkoutUrl; // Redirect to checkout page
    } catch (error) {
      setPending(false);
      console.error(error);
      toast("Failed to load checkout. Please try again.");
    }
  }

  return { startCheckoutFlow, pending };
}

// loading state stays true until redirecting over
// Added a null/undefined check before assigning to window.location.href