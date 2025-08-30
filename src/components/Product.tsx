import { products } from "@wix/stores";
import Link from "next/link";
import { Badge } from "./ui/badge";
import DiscountBadge from "./DiscountBadge";
import { formatCurrency } from "@/lib/utils";
import WixImage from "./WixImage";

interface ProductProps {
  product: products.Product;
}

export default function Product({ product }: ProductProps) {
  const main = product.media?.mainMedia?.image;

  const second = product.media?.items?.[1]?.image

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-card h-full border"
    >
      <div className="relative overflow-hidden">
        <WixImage
          mediaIdentifier={main?.url}
          alt={main?.altText ?? product.name}
          width={700}
          height={700}
          className="block transition-opacity duration-300 group-hover:opacity-0"
        />

        <WixImage
          mediaIdentifier={second?.url}
          alt={second?.altText ?? product.name}
          width={700}
          height={700}
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="absolute right-3 bottom-3 flex flex-wrap items-center gap-2">
          {product.ribbon && <Badge>{product.ribbon}</Badge>}
          {product.discount && <DiscountBadge data={product.discount} />}
          <Badge className="bg-secondary text-secondary-foreground font-semibold">
            {getFormattedPrice(product)}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 p-3">
        <h3 className="text-lg font-bold">{product.name}</h3>
        <div
          className="line-clamp-2"
          dangerouslySetInnerHTML={{ __html: product.description || "" }}
        />
      </div>
    </Link>
  );
}

function getFormattedPrice(product: products.Product) {
  const minPrice = product.priceRange?.minValue;
  const maxPrice = product.priceRange?.maxValue;

  if (minPrice && maxPrice && minPrice !== maxPrice) {
    return `from ${formatCurrency(minPrice, product.priceData?.currency)}`;
  } else {
    return (
      product.priceData?.formatted?.discountedPrice ||
      product.priceData?.formatted?.price ||
      "n/a"
    );
  }
}
