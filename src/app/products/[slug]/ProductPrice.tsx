import DiscountBadge from "@/components/DiscountBadge"
import { cn } from "@/lib/utils"
import { products } from "@wix/stores"

interface ProductPriceProps {
  product: products.Product
  selectedVariant: products.Variant | null
}

export default function  ProductPrice ({product, selectedVariant}: ProductPriceProps) {
   const priceData = selectedVariant?.variant?.priceData || product.priceData
  
  if(!priceData) return null

  // if has a discount price

  const hasDiscount = priceData.discountedPrice !== priceData.price

   return (
    <div className="flex items-center gap-3 text-xl font-bold">
      <span className={cn(hasDiscount && 'line-through text-muted-foreground', !hasDiscount && 'text-foreground')}>
        {priceData.formatted?.price}
      </span>
      {hasDiscount && 
        <span className="text-2xl text-primary">
          {priceData.formatted?.discountedPrice}
        </span>
      }
      {product.discount && <DiscountBadge data={product.discount} />}
    </div>
  )
}