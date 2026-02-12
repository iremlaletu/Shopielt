import { getWixServerClient } from "@/lib/wix-client.server";
import { EditorsPickItem, getEditorsPicks } from "@/wix-api/editorpicks";
import WixImage from "@/components/WixImage";
import Link from "next/link";

function PickCard({
  pick,
  align = "left",
}: {
  pick: EditorsPickItem;
  align?: "left" | "right";
}) {
  const title = pick.title_fld || "Editor’s Pick";
  const href = `/editorial/${pick.slug}`;

  return (
    <Link
      href={href}
      className={[
        "group grid items-center gap-6 sm:gap-10",
        "grid-cols-1 md:grid-cols-2",
        align === "left" ? "" : "md:[&_.media]:order-2",
      ].join(" ")}
    >
      {/* Image */}
      <div className="media">
        <div className="bg-card relative overflow-hidden rounded-3xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
          <div className="relative h-[260px] w-full sm:h-[320px]">
            <WixImage
              mediaIdentifier={pick.image_fld}
              alt={pick.imagealttext_fld || title}
              className="block h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </div>

          <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/20 via-transparent to-transparent" />
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
          Editor&apos;s Pick Setup
        </p>

        <h3 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h3>

        <div className={align === "left" ? "" : "md:flex md:justify-end"}>
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <span className="decoration-border group-hover:decoration-foreground underline underline-offset-4">
              Explore setup
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

export default async function EditorialPage() {
  const wixClient = await getWixServerClient();
  const picks = (await getEditorsPicks(wixClient)) as EditorsPickItem[];

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-5 py-12">
      {/* HEADER */}
      <section className="max-w-4xl space-y-4">
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          Editorial
        </p>

        <h1 className="text-4xl font-extrabold tracking-tight">
          Editor’s Picks
        </h1>

        <p className="text-muted-foreground">
          Curated setups designed to inspire your daily rituals. Explore each
          environment and shop the exact products used.
        </p>
      </section>

      {/* LIST */}
      <section className="space-y-10 sm:space-y-20">
        {picks.map((pick, idx) => (
          <PickCard
            key={pick._id}
            pick={pick}
            align={idx % 2 === 0 ? "left" : "right"}
          />
        ))}
      </section>
    </main>
  );
}
