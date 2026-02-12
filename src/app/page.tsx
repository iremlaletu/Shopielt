
import { Button } from "@/components/ui/button";
import { getWixServerClient } from "@/lib/wix-client.server";
import { getCollections } from "@/wix-api/collections";
import Image from "next/image";
import Link from "next/link";

function CategoryCard({
  cat,
  align = "left",
}: {
  cat: {
    id: string;
    title: string;
    subtitle: string;
    href: string;
    image: string;
  };
  align?: "left" | "right";
}) {
  return (
    <Link
      href={cat.href}
      className={[
        "group grid items-center gap-6 sm:gap-10",
        "grid-cols-1 md:grid-cols-2",
        align === "left" ? "" : "md:[&_.media]:order-2",
      ].join(" ")}
    >
      {/* Image */}
      <div className="media">
        <div className="bg-card relative overflow-hidden rounded-3xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
          <Image
            src={cat.image}
            alt={cat.title}
            width={1400}
            height={1000}
            className="h-[260px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] sm:h-[320px]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </div>

      {/* Text */}
      <div
        className={[
          "space-y-3",
          align === "left" ? "md:pl-2" : "md:pr-2 md:text-right",
        ].join(" ")}
      >
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
          {cat.subtitle}
        </p>

        <h3 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          {cat.title}
        </h3>

        <div className={align === "left" ? "" : "md:flex md:justify-end"}>
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <span className="decoration-border group-hover:decoration-foreground underline underline-offset-4">
              Shop now
            </span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const wixClient = await getWixServerClient();
  const collections = await getCollections(wixClient);

  const heroImage =
    "https://images.unsplash.com/photo-1587301669187-732ea66e7617?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29ya3NwYWNlfGVufDB8MXwwfHx8Mg%3D%3D";

  return (
    <main className="bg-background text-foreground mx-auto max-w-[90rem] px-4">
      {/* HERO */}
      <section className="relative pt-10 sm:pt-12 lg:pt-16">
        <div className="bg-muted w-full overflow-hidden rounded-3xl">
          <div className="flex flex-col md:flex-row">
            {/* LEFT */}
            <div className="text-center md:basis-1/2 md:text-left">
              <div className="bg-card text-card-foreground px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
                <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                  Designed for everyday clarity
                </p>

                <h1 className="mt-4 text-4xl leading-[0.95] font-extrabold tracking-tight sm:text-6xl lg:text-[90px]">
                  DAILY
                  <br /> ESSENTIALS
                  <br /> BRAND
                </h1>

                <h3 className="text-muted-foreground py-6 text-base sm:text-xl lg:text-2xl">
                  Thoughtful goods for{" "}
                  <span className="text-foreground font-semibold">
                    daily rituals
                  </span>
                </h3>

                <div className="flex flex-col gap-3 sm:flex-row md:justify-start">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Link href="/shop">Browse Shop</Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Link href="#collections">Explore Collections</Link>
                  </Button>
                </div>
              </div>

              <div className="bg-background hidden h-[75px] w-full md:block" />
            </div>

            {/* RIGHT */}
            <div className="md:basis-1/2">
              <div className="relative h-[240px] w-full overflow-hidden sm:h-[320px] md:h-[540px] lg:h-[620px]">
                <Image
                  src={heroImage}
                  alt="Hero"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section id="collections" className="py-16 sm:px-14 sm:py-24">
        <div className="mb-10 sm:mb-14">
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Four curated categories - built for your daily rhythm.
          </p>
        </div>

        <div className="space-y-10 sm:space-y-20">
          {collections.map((collection, idx) => (
            <CategoryCard
              key={collection._id}
              cat={{
                id: collection._id || "",
                title: collection.name || "",
                subtitle: collection.description || "Shop this collection",
                href: `/collections/${collection.slug}`,
                image: collection.media?.mainMedia?.image?.url || "",
              }}
              align={idx % 2 === 0 ? "left" : "right"}
            />
          ))}
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="text-muted-foreground py-12 text-center sm:px-14">
        <p className="mx-auto max-w-2xl">
          Want us to build a routine for you? Reach out and we’ll help curate
          the perfect set.
        </p>
      </section>
    </main>
  );
}