"use client";

import { Badge } from "@/components/ui/badge";
import { products } from "@wix/stores";
import ProductOptions from "./ProductOptions";
import ProductPrice from "./ProductPrice";
import { useState } from "react";
import { checkInStock, findVariant } from "@/lib/utils";
import ProductMedia from "./ProductMedia";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InfoIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AddToCartButton from "@/components/AddToCartButton";

interface ProductDetailsProps {
  product: products.Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);

  // state to hold selected options with default values as first choice of each option
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(
    product.productOptions
      ?.map((option) => ({
        [option.name || ""]: option.choices?.[0].description || "",
      }))
      ?.reduce((acc, curr) => ({ ...acc, ...curr }), {}) || {},
  );

  // findVariant comes from utils.ts
  // it matches selected options to find the correct variant
  // e.g. if user selects size: small and color: red, it finds that specific variant
  // important for showing correct price, stock status, etc.
  const selectedVariant = findVariant(product, selectedOptions);

  // checkInStock from utils.ts
  const inStock = checkInStock(product, selectedOptions);

  const availableQuantity =
    selectedVariant?.stock?.quantity ?? product.stock?.quantity;

  // true if user selected quantity exceeds available stock
  const availableQuantityExceeded =
    !!availableQuantity && quantity > availableQuantity;

  // for each options (e.g. size, color), get media items of the selected choice if atteched
  // pass this to ProductMedia to show image corresponding to selected option
  const selectedOptionsMedia = product.productOptions?.flatMap((option) => {
    const selectedChoice = option.choices?.find(
      (choice) => choice.description === selectedOptions[option.name || ""],
    );
    return selectedChoice?.media?.items ?? [];
  });

  return (
    <div className="flex flex-col gap-10 md:flex-row lg:gap-20">
      { /* Check if there is an image for the selected option, otherwise fallback to product images */ }
      <ProductMedia
        media={
          !!selectedOptionsMedia?.length
            ? selectedOptionsMedia
            : product.media?.items
        }
      />
      <div className="basis-3/5 space-y-10">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold lg:text-4xl">{product.name}</h1>
          {product.brand && (
            <div className="text-muted-foreground">{product.brand}</div>
          )}
          {product.ribbon && <Badge className="block">{product.ribbon}</Badge>}
          {product.description && (
            <div
              dangerouslySetInnerHTML={{ __html: product.description }}
              className="prose dark:prose-invert"
            />
          )}
          <ProductPrice product={product} selectedVariant={selectedVariant} />

          <ProductOptions
            product={product}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
          />
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-3">
              <Input
                name="quantity"
                type="number"
                value={quantity}
                onChange={(e) => {
                  setQuantity(Number(e.target.value));
                  console.log(e.target.value);
                }}
                className="w-20"
                disabled={!inStock}
                max={availableQuantity ?? undefined}
              />
              {!!availableQuantity &&
                (availableQuantityExceeded || availableQuantity < 10) && (
                  <span className="text-destructive">
                    Only {availableQuantity} left in stock
                  </span>
                )}
            </div>
          </div>
        </div>

        {inStock ? (
          <AddToCartButton product={product} selectedOptions={selectedOptions} quantity={quantity} />
        ) : ( <div className="underline">Out of Stock</div> ) }

        {!!product.additionalInfoSections?.length && (
          <div className="text-muted-foreground space-y-5 text-sm">
            <span className="flex items-center gap-2">
              <InfoIcon className="size-5" />
              <span>Additional product information</span>
            </span>
            <Accordion type="multiple">
              {product.additionalInfoSections.map((section) => (
                <AccordionItem value={section.title || ""} key={section.title}>
                  <AccordionTrigger>{section.title}</AccordionTrigger>
                  <AccordionContent>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: section.description || "",
                      }}
                      className="prose text-muted-foreground dark:prose-invert text-sm"
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
}
