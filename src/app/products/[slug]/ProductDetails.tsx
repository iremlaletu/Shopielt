"use client";

import { Badge } from "@/components/ui/badge";
import { products } from "@wix/stores";
import ProductOptions from "./ProductOptions";
import ProductPrice from "./ProductPrice";
import { useState } from "react";
import { checkInStock, findVariant } from "@/lib/utils";
import ProductMedia from "./ProductMedia";


interface ProductDetailsProps {
  product: products.Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
   const [quantity, setQuantity] = useState(1);

   // state to hold selected options with default values as first choice of each option
   const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
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

    return (
    <div className="flex flex-col gap-10 md:flex-row lg:gap-20">
      <ProductMedia media={product.media?.items} />
      <div className="basis-3/5 space-y-5">
        <div className="space-y-2">
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
        
        <ProductOptions product={product} selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} />
        </div>
        
      </div>
    </div>
  );
}
