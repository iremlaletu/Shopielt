import { getWixServerClient } from "@/lib/wix-client.server";
import { getProductById } from "@/wix-api/products";
import { notFound, redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

    const query = new URLSearchParams(
    Object.entries(sp ?? {}).flatMap(([key, value]) =>
      Array.isArray(value)
        ? value.map((v) => [key, v])
        : value !== undefined
          ? [[key, value]]
          : []
    )
  ).toString();

  if (id === "someId") {
    redirect(`/products/i-m-a-product-1?${query}`);
  }

  const product = await getProductById(await getWixServerClient(), id);

  if (!product) notFound();

  redirect(`/products/${product.slug}?${query}`);
}

