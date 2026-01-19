"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { currentCart } from "@wix/ecom";
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from "@/hooks/cart";
import { useRouter, useSearchParams } from "next/navigation";

// Step configuration used for the header progress indicator
const steps = [
  { id: 1, title: "Shopping Cart" },
  { id: 2, title: "Shipping Address" },
  { id: 3, title: "Payment Method" },
];

interface CheckoutPageClientProps {
  initialData: currentCart.Cart | null;
}

export default function CheckoutPageClient({
  initialData,
}: CheckoutPageClientProps) {
  const cartQuery = useCart(initialData);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive items & totals from the Wix cart
  const items = cartQuery.data?.lineItems ?? [];
  const hasItems = items.length > 0;

  const totalQuantity =
    cartQuery.data?.lineItems?.reduce(
      (acc, item) => acc + (item.quantity || 0),
      0,
    ) || 0;

  { /* @ts-expect-error: subtotal defined on cartQuery.data */}
  const subtotal = cartQuery.data?.subtotal?.formattedConvertedAmount;

  // Active step from the URL (?step=1|2|3), fallback to 1
  const activeStepParam = searchParams.get("step");
  let activeStep = Number(activeStepParam ?? "1");
  if (Number.isNaN(activeStep) || activeStep < 1 || activeStep > 3) {
    activeStep = 1;
  }

  // Small helper to navigate between steps without scrolling to top
  function goToStep(step: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(step));
    router.push(`/democheckout?${params.toString()}`, { scroll: false });
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      {/* PAGE TITLE */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Demo Checkout</h1>
        <p className="text-muted-foreground max-w-xl text-center text-sm">
          This is a sample checkout UI for demo purposes only. The real checkout
          is handled by Wix&apos;s hosted page, and this flow does not create
          real orders or send any data to a backend.
        </p>
      </div>

      {/* STEPS HEADER */}
      <div className="flex w-full flex-col items-center justify-center gap-6 lg:flex-row lg:gap-10">
        {" "}
      
        {steps.map((step) => {
          const isActive = step.id === activeStep;
          return (
           
            <div
              key={step.id}
              className={`flex w-full max-w-sm items-center gap-2 border-b-2 pb-3 ${
                
                isActive ? "border-foreground" : "border-muted"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${
                  isActive ? "bg-foreground/80" : "bg-muted-foreground/60"
                }`}
              >
                {step.id}
              </div>
              <p
                className={`text-left text-sm font-medium ${
             
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </p>
            </div>
          );
        })}
      </div>
      {/* MAIN CONTENT: LEFT (step content) + RIGHT (cart details) */}
      <div className="flex w-full flex-col gap-8 lg:flex-row">
        {/* LEFT: STEP CONTENT */}
        <div className="bg-background flex w-full flex-col gap-6 rounded-lg border p-6 shadow-sm lg:w-7/12">
          {activeStep === 1 && (
            <StepCart items={items} hasItems={hasItems} cartQuery={cartQuery} />
          )}

          {activeStep === 2 && <StepShipping hasItems={hasItems} />}

          {activeStep === 3 && <StepPayment hasItems={hasItems} />}
        </div>

        {/* RIGHT: CART DETAILS / SUMMARY */}
        <aside className="bg-background flex h-max w-full flex-col gap-4 rounded-lg border p-6 shadow-sm lg:w-5/12">
          <h2 className="text-lg font-semibold">Cart Details</h2>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Items</p>
              <p className="font-medium">{totalQuantity}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-muted-foreground">Subtotal</p>
              <p className="font-medium">{subtotal ?? "—"}</p>
            </div>

            {/* Just some placeholder demo values */}
            <div className="flex justify-between">
              <p className="text-muted-foreground">Estimated shipping</p>
              <p className="font-medium">$0.00</p>
            </div>

            <div className="flex justify-between">
              <p className="text-muted-foreground">Estimated tax</p>
              <p className="font-medium">$0.00</p>
            </div>

            <hr className="border-muted" />

            <div className="flex justify-between">
              <p className="font-semibold">Estimated total</p>
              <p className="font-semibold">{subtotal ?? "—"}</p>
            </div>
          </div>

          {/* STEP NAVIGATION BUTTONS */}
          <div className="mt-2 flex flex-col gap-2">
            {activeStep === 1 && (
              <Button
                className="w-full"
                disabled={!hasItems}
                onClick={() => goToStep(2)}
              >
                Continue to shipping
              </Button>
            )}

            {activeStep === 2 && (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => goToStep(1)}
                >
                  Back to cart
                </Button>
                <Button
                  className="w-full"
                  disabled={!hasItems}
                  onClick={() => goToStep(3)}
                >
                  Continue to payment
                </Button>
              </>
            )}

            {activeStep === 3 && (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => goToStep(2)}
                >
                  Back to shipping
                </Button>
                <Button className="w-full" disabled>
                  Place order (disabled in demo)
                </Button>
              </>
            )}
          </div>

          {/* Small hint for the viewer */}
          {!hasItems && (
            <p className="text-muted-foreground text-xs">
              Tip: Add some items to your cart from the shop page to see the
              full multi-step checkout experience.
            </p>
          )}
        </aside>
      </div>

      {/* BOTTOM ACTIONS */}
      <section className="mt-2 flex items-center justify-between gap-4">
        <Button asChild variant="outline">
          <Link href="/shop">Back to shop</Link>
        </Button>
      </section>
    </main>
  );
}

/* ---------- STEP 1: CART CONTENT ---------- */

interface StepCartProps {
  items: currentCart.LineItem[];
  hasItems: boolean;
  cartQuery: ReturnType<typeof useCart>;
}

function StepCart({ items, hasItems, cartQuery }: StepCartProps) {
  const updateQuantityMutation = useUpdateCartItemQuantity();
  const removeItemMutation = useRemoveCartItem();

  if (cartQuery.isPending) {
    return <p className="text-muted-foreground text-sm">Loading cart…</p>;
  }

  if (!hasItems) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Shopping Cart</h2>
        <p className="text-muted-foreground text-sm">
          Your cart is empty. Add some products to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Shopping Cart</h2>
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const productId = item._id;
          if (!productId) return null;

          const quantity = item.quantity ?? 0;
          const quantityLimitReached =
            !!item.quantity &&
            !!item.availability?.quantityAvailable &&
            item.quantity >= item.availability.quantityAvailable;

          return (
            <div
              key={productId}
              className="bg-muted/30 flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <div className="flex flex-col gap-1">
                <p className="font-semibold">
                  {item.productName?.translated || "Item"}
                </p>
                {!!item.descriptionLines?.length && (
                  <p className="text-muted-foreground text-xs">
                    {item.descriptionLines
                      .map(
                        (line) =>
                          line.colorInfo?.translated ||
                          line.plainText?.translated,
                      )
                      .join(", ")}
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  Unit price: {item.price?.formattedConvertedAmount ?? "—"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={quantity <= 1}
                    onClick={() =>
                      updateQuantityMutation.mutate({
                        productId,
                        newQuantity: quantity - 1,
                      })
                    }
                  >
                    -
                  </Button>
                  <span>{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={quantityLimitReached}
                    onClick={() =>
                      updateQuantityMutation.mutate({
                        productId,
                        newQuantity: quantity + 1,
                      })
                    }
                  >
                    +
                  </Button>
                </div>

                <button
                  onClick={() => removeItemMutation.mutate(productId)}
                  className="text-destructive text-xs hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- STEP 2: SHIPPING (DEMO ONLY) ---------- */

function StepShipping({ hasItems }: { hasItems: boolean }) {
  if (!hasItems) {
    return (
      <p className="text-muted-foreground text-sm">
        Please add items to your cart before entering a shipping address.
      </p>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-lg font-semibold">Shipping Address</h2>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Full name
          </p>
          <div className="bg-muted/50 h-9 rounded-md border" />
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Email
          </p>
          <div className="bg-muted/50 h-9 rounded-md border" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Address
          </p>
          <div className="bg-muted/50 h-9 rounded-md border" />
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            City
          </p>
          <div className="bg-muted/50 h-9 rounded-md border" />
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Postal code
          </p>
          <div className="bg-muted/50 h-9 rounded-md border" />
        </div>
      </div>
    </div>
  );
}

/* ---------- STEP 3: PAYMENT (DEMO ONLY) ---------- */

function StepPayment({ hasItems }: { hasItems: boolean }) {
  if (!hasItems) {
    return (
      <p className="text-muted-foreground text-sm">
        Please add items to your cart and complete the shipping step before
        reaching payment.
      </p>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-lg font-semibold">Payment Method</h2>
      <p className="text-muted-foreground">
        In a real production checkout, this step would integrate with a payment
        provider (card details, wallets, etc.) or with Wix&apos;s hosted
        checkout. For this portfolio demo, payment is intentionally disabled -
        this page only demonstrates the UI and flow.
      </p>

      <div className="space-y-3">
        <div className="bg-muted/40 flex items-center justify-between rounded-md border px-3 py-2">
          <span>Credit / debit card</span>
          <span className="text-muted-foreground text-xs">
            (Demo only, disabled)
          </span>
        </div>
        <div className="bg-muted/40 flex items-center justify-between rounded-md border px-3 py-2">
          <span>PayPal</span>
          <span className="text-muted-foreground text-xs">
            (Demo only, disabled)
          </span>
        </div>
      </div>
    </div>
  );
}
