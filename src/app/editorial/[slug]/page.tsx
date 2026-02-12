import { getWixServerClient } from "@/lib/wix-client.server";
import { getEditorsPickWithProductsBySlug } from "@/wix-api/editorpicks";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import WixImage from "@/components/WixImage";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const wixClient = await getWixServerClient();

  const data = await getEditorsPickWithProductsBySlug(wixClient, slug);

  if (!data) notFound();

  const { pick } = data;

  return {
    title: pick.title_fld || "Editor’s Pick",
    description: pick.description_fld
      ? stripHtml(pick.description_fld).slice(0, 160)
      : "Editor’s pick setup",
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const wixClient = await getWixServerClient();

  const data = await getEditorsPickWithProductsBySlug(wixClient, slug);
  if (!data) notFound();

  const { pick, products } = data;

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      {/* Banner */}
      <section className="space-y-5">
        <div className="grid gap-6 overflow-hidden md:grid-cols-2">
          {/*Story + CTA */}
          <div className="p-3">
            <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
              Editor&apos;s Pick
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
              {pick.title_fld}
            </h1>

            <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <span>
                {products.length} item{products.length === 1 ? "" : "s"}
              </span>
            </div>

            {pick.description_fld ? (
              <div
                className="prose prose-sm text-muted-foreground dark:prose-invert mt-6 max-w-none"
                dangerouslySetInnerHTML={{ __html: pick.description_fld }}
              />
            ) : (
              <p className="text-muted-foreground mt-6 text-sm">
                A minimal setup designed to remove distractions and support deep
                work.
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="outline" size="lg">
                <Link href="/shop">Browse shop</Link>
              </Button>
              <Button asChild size="lg">
                <Link href="#products">Shop this setup</Link>
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="bg-muted relative">
            <div className="relative h-[280px] w-full sm:h-[360px] md:h-full md:min-h-[420px]">
              {pick.image_fld ? (
                <>
                  <WixImage
                    mediaIdentifier={pick.image_fld}
                    alt={
                      pick.imagealttext_fld || pick.title_fld || "Editor’s Pick"
                    }
                    className="h-full w-full object-cover object-center"
                  />
                  {/* subtle overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
                </>
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      
      <section id="products" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Products in this setup</h2>
          <p className="text-muted-foreground text-sm">
            {products.length} item{products.length === 1 ? "" : "s"}
          </p>
        </div>

        {!products.length ? (
          <p className="text-muted-foreground text-sm">
            No products linked yet. Add products to the multi-reference field in
            Wix CMS.
          </p>
        ) : (
          <div className="divide-y">
            {products.map((p, index) => (
              <Link
                key={p._id}
                href={`/products/${p.slug}`}
                className="group hover:bg-muted/40 flex items-center gap-6 p-6 transition-all duration-300"
              >
                {/* NUMBER */}
                <div className="text-muted-foreground w-10 text-2xl font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* IMAGE */}
                <div className="bg-muted relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                  <WixImage
                    mediaIdentifier={p.mainMedia}
                    alt={p.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                {/* INFO */}
                <div className="flex flex-1 items-center justify-between">
                  <div className="space-y-1">
                    <p className="leading-none font-medium">{p.name}</p>

                    {p.ribbon && (
                      <span className="text-muted-foreground text-xs">
                        {p.ribbon}
                      </span>
                    )}
                  </div>

                  {/* PRICE */}
                  <div className="text-right">
                    <p className="font-medium">
                      {p.formattedDiscountedPrice || p.formattedPrice}
                    </p>

                    {p.formattedDiscountedPrice && (
                      <p className="text-muted-foreground text-xs line-through">
                        {p.formattedPrice}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
