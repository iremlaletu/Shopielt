import { env } from "@/env";
import { WixClient } from "@/lib/wix-client.base";
import { checkout } from "@wix/ecom";

export async function getCheckoutUrlForCurrentCart(wixClient: WixClient) {
  const { checkoutId } =
    await wixClient.currentCart.createCheckoutFromCurrentCart({
      channelType: checkout.ChannelType.WEB,
    });

  const { redirectSession } = await wixClient.redirects.createRedirectSession({
    ecomCheckout: { checkoutId },
    callbacks: {
      postFlowUrl: window.location.href,
      thankYouPageUrl: env.NEXT_PUBLIC_BASE_URL + "/checkout-success",
    },
  });
  if (!redirectSession) {
    throw Error("Failed to create redirect session");
  }

  return redirectSession.fullUrl;
}

// Wix docs: https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/purchase-flow/cart/cart/create-checkout-from-current-cart?apiView=SDK
// callbacks block defines where to redirect the user after the checkout flow is completed.
// Thank you page URL is where the user will be redirected after a successful purchase.
// https://dev.wix.com/docs/api-reference/business-management/headless/redirects/sample-flows

// to use, wrap this into hook hook/checkout.ts
