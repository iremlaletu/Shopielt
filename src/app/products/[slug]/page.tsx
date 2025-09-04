import { getProductBySlug } from "@/wix-api/products";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";
import { Metadata } from "next";
import { delay } from "@/lib/utils";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params : {slug} }: PageProps) :Promise <Metadata> {
  const product = await getProductBySlug(slug);
  if(!product) notFound();

  const mainImage = product.media?.mainMedia?.image;

  return {
    title: product.name,
    description:" Get this product at the best price", 
    openGraph: {
      images: mainImage?.url
      ? [
          {
            url: mainImage.url,
            width: mainImage.width,
            height: mainImage.height,
            alt: mainImage.altText || "",
            type: 'image/jpeg',
          }
      ] : undefined
    }
  }
}


export default async function Page({ params: {slug} }: PageProps) {
  
  await delay(3000); 
  
  const product = await getProductBySlug(slug);

  if (!product?._id) notFound();

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <ProductDetails product={product} />
    </main>
  );
}

{/*
    to see single product data in json format
    <pre>
        {JSON.stringify(product, null, 2)}
    </pre>
*/}

