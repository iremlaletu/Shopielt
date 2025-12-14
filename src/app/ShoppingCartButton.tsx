"use client";

import CheckoutButton from "@/components/CheckoutButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import WixImage from "@/components/WixImage";
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from "@/hooks/cart";
import { currentCart } from "@wix/ecom";
import { Loader2, ShoppingCartIcon, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ShoppingCartButtonProps {
  initialData: currentCart.Cart | null;
}

export default function ShoppingCartButton({
  initialData,
}: ShoppingCartButtonProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const cartQuery = useCart(initialData);

  const totalQuantity =
    cartQuery.data?.lineItems?.reduce(
      (acc, item) => acc + (item.quantity || 0),
      0,
    ) || 0;

  return (
    <>
      <div className="relative">
        <Button variant="ghost" size="icon" onClick={() => setSheetOpen(true)}>
          <ShoppingCartIcon className="size-5" />
          <span className="bg-primary text-primary-foreground absolute top-[-2px] right-[-2px] flex size-5 items-center justify-center rounded-full text-xs">
            {totalQuantity < 10 ? totalQuantity : "9+"}
          </span>
        </Button>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              Your cart
              <span className="text-base">
                ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
              </span>
            </SheetTitle>
            <SheetDescription>
              Review the items in your cart. You can update quantities, remove
              products, or continue to checkout when you’re ready.
            </SheetDescription>
          </SheetHeader>
          <div className="flex grow flex-col space-y-5 overflow-y-auto p-1">
            <ul className="space-y-5">
              {cartQuery.data?.lineItems?.map((item) => (
                <ShoppingCartItem
                  key={item._id}
                  item={item}
                  onProductLinkClicked={() => setSheetOpen(false)}
                />
              ))}
            </ul>
            {cartQuery.isPending && (
              <Loader2 className="mx-auto animate-spin" />
            )}
            {cartQuery.error && (
              <p className="text-destructive">{cartQuery.error.message}</p>
            )}
            {!cartQuery.isPending && !cartQuery.data?.lineItems?.length && (
              <div className="flex flex-1 justify-center p-2">
                <div className="text-center">
                  <div className="bg-secondary ring-border mx-auto mb-3 flex size-14 items-center justify-center rounded-full ring-1">
                    <ShoppingCartIcon
                      className="text-primary size-7"
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="text-lg font-semibold">Your cart is empty</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Add items to get started.
                  </p>

                  <div className="mt-4 grid w-full max-w-sm grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      asChild
                      className="w-full"
                      onClick={() => setSheetOpen(false)}
                    >
                      <Link href="/shop">Start shopping now</Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                      onClick={() => setSheetOpen(false)}
                    >
                      <Link href="/collections/new">New arrivals</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <hr />
          <div className="flex items-center justify-between gap-5 p-3">
            <div className="space-y-1">
              <p className="text-sm">Subtotal amount:</p>
              <p>
                {/* @ts-expect-error: subtotal defined on cartQuery.data */}
                {cartQuery.data?.subtotal?.formattedConvertedAmount}
              </p>
              <p className="text-muted-foreground text-xs">
                Shipping and taxes calculated at checkout
              </p>
            </div>
            <CheckoutButton
              size="lg"
              disabled={!totalQuantity || cartQuery.isFetching}
            />
          </div>
          <Button asChild variant="outline" size="lg">
              <Link href="/democheckout">
                View a sample custom checkout UI (no backend)
              </Link>
            </Button>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface ShoppingCartItemProps {
  item: currentCart.LineItem;
  onProductLinkClicked: () => void;
}

function ShoppingCartItem({
  item,
  onProductLinkClicked,
}: ShoppingCartItemProps) {
  const updateQuantityMutation = useUpdateCartItemQuantity();
  const removeItemMutation = useRemoveCartItem();

  const productId = item._id; // Our hook expects the productId to be defined but can be null or undefined
  if (!productId) return null;

  const slug = item.url?.split("/").pop(); // last part of the url for get linked to page

  const quantityLimitReached =
    !!item.quantity &&
    !!item.availability?.quantityAvailable &&
    item.quantity >= item.availability.quantityAvailable;

  return (
    <li className="flex items-center gap-3">
      <div className="relative size-fit flex-none">
        <Link href={`/products/${slug}`} onClick={onProductLinkClicked}>
          <WixImage
            mediaIdentifier={item.image}
            width={110}
            height={110}
            alt={item.productName?.translated || "Product image"}
            className="bg-secondary flex-none"
          />
        </Link>
        <button
          onClick={() => removeItemMutation.mutate(productId)}
          className="bg-background absolute -top-1 -right-1 cursor-pointer rounded-full border p-0.5 ring-1"
        >
          <X className="size-3" />
        </button>
      </div>
      <div className="space-y-1.5 text-sm">
        <Link href={`/products/${slug}`} onClick={onProductLinkClicked}>
          <p className="font-bold">{item.productName?.translated || "Item"}</p>
        </Link>
        {!!item.descriptionLines?.length && (
          <p>
            {item.descriptionLines
              .map(
                (line) =>
                  line.colorInfo?.translated || line.plainText?.translated,
              )
              .join(", ")}
          </p>
        )}
        <div className="flex items-center gap-2">
          {item.quantity} x {item.price?.formattedConvertedAmount}
          {item.fullPrice && item.fullPrice.amount !== item.price?.amount && (
            <span className="text-muted-foreground line-through">
              {item.fullPrice.formattedConvertedAmount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={item.quantity === 1}
            onClick={() =>
              updateQuantityMutation.mutate({
                productId,
                newQuantity: !item.quantity ? 1 : item.quantity - 1,
              })
            }
          >
            -
          </Button>
          <span>{item.quantity}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={quantityLimitReached}
            onClick={() =>
              updateQuantityMutation.mutate({
                productId,
                newQuantity: !item.quantity ? 0 : item.quantity + 1,
              })
            }
          >
            +
          </Button>
          {quantityLimitReached && <span>Quantity limit reached</span>}
        </div>
      </div>
    </li>
  );
}
