import { getProductBySlug, getRelatedProducts } from "@/wix-api/products";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";
import { Metadata } from "next";
import { delay } from "@/lib/utils";
import { getWixServerClient } from "@/lib/wix-client.server";
import { Suspense } from "react";
import Product from "@/components/Product";
import ProductSkeleton from "@/components/ProductSkeleton";
import { products } from "@wix/stores";
import { getLoggedInMember } from "@/wix-api/members";
import CreateProductReviewButton from "@/components/reviews/CreateProductReviewButton";
import ProductReviews, {
  ProductReviewsLoadingSkeleton,
} from "./ProductReviews";
import { getProductReviews } from "@/wix-api/reviews";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const wix = await getWixServerClient();
  const product = await getProductBySlug(wix, slug);

  if (!product) notFound();

  const mainImage = product.media?.mainMedia?.image;

  return {
    title: product.name,
    description: " Get this product at the best price",
    openGraph: {
      images: mainImage?.url
        ? [
            {
              url: mainImage.url,
              width: mainImage.width,
              height: mainImage.height,
              alt: mainImage.altText || "",
              type: "image/jpeg",
            },
          ]
        : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  await delay(1000);

  const { slug } = await params;
  const wix = await getWixServerClient();
  const product = await getProductBySlug(wix, slug);

  if (!product?._id) notFound();

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <ProductDetails product={product} />
      <hr />
      <Suspense fallback={<RelatedProductsLoadingSkeleton />}>
        <RelatedProducts productId={product._id} />
      </Suspense>
      <hr />
      <div className="space-y-8">
        <h2 className="text-2xl font-bold"> Reviews </h2>
        <Suspense fallback={<ProductReviewsLoadingSkeleton />}>
          <ProductReviewSection product={product} />
        </Suspense>
      </div>
    </main>
  );
}

interface RelatedProductsProps {
  productId: string;
}

async function RelatedProducts({ productId }: RelatedProductsProps) {
  await delay(1000);
  const relatedProducts = await getRelatedProducts(
    await getWixServerClient(),
    productId,
  );

  if (!relatedProducts.length) return null;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Recommended for You</h2>
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid lg:grid-cols-4">
        {relatedProducts.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

function RelatedProductsLoadingSkeleton() {
  return (
    <div className="flex grid-cols-2 flex-col gap-5 pt-12 sm:grid lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

interface ProductReviewSectionProps {
  product: products.Product;
}

// every user can only write one review per product, if the user already submit one, prevent open the dialog form cause dont want to let user fill out form

async function ProductReviewSection({ product }: ProductReviewSectionProps) {
  if (!product._id) return null;
  const wixClient = getWixServerClient();
  const loggedInMember = await getLoggedInMember(await wixClient);

  const existingReview = loggedInMember?.contactId
    ? (await getProductReviews(await wixClient, {
        productId: product._id,
        contactId: loggedInMember.contactId,
      })).items[0]
    : null;

  await delay(5000);
  return (
    <div className="space-y-8">
      <CreateProductReviewButton
        product={product}
        loggedInMember={loggedInMember}
        hasExistingReview={!!existingReview}
      />
      <ProductReviews product={product} />
    </div>
  );
}
