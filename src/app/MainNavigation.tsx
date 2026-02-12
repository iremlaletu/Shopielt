import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { EditorsPickItem } from "@/wix-api/editorpicks";
import WixImage from "@/components/WixImage";

type Props = {
  className?: string;
  editorsPicks: EditorsPickItem[];
};

function PickCard({ pick }: { pick: EditorsPickItem }) {
  return (
    <NavigationMenuLink asChild>
      <Link href={`/editorial/${pick.slug}`} className="block">
        <div className="group relative h-[200px] overflow-hidden rounded-3xl">
          <WixImage
            mediaIdentifier={pick.image_fld}
            alt={pick.imagealttext_fld || pick.title_fld || ""}
            className="block h-full w-full object-cover object-center transition-transform duration-500 ease-out transform-gpu group-hover:scale-[1.08]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="text-xs tracking-[0.2em] uppercase opacity-80">
              Editor&apos;s Pick
            </div>
            <div className="mt-1 text-sm font-semibold leading-tight">
              {pick.title_fld || "Setup"}
            </div>
          </div>
        </div>
      </Link>
    </NavigationMenuLink>
  );
}

export default function MainNavigation({ className, editorsPicks }: Props) {
  const picks = (editorsPicks ?? []).slice(0, 3);
  const [p1, p2, p3] = picks;

  return (
    <NavigationMenu className={`${className} z-10`} viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Editorial</NavigationMenuTrigger>

          <NavigationMenuContent>
            <div className="grid gap-3 p-3 md:w-[560px] lg:w-[860px] lg:grid-cols-2">
              {/* 1) Intro card */}
              <div className="p-5">
                <div className="mt-2 text-lg leading-snug font-semibold">
                  Curated desk setups.
                </div>

                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Each pick is a complete workspace mood: a hero look + the
                  exact products used inside it. Open a setup to shop the full
                  list.
                </p>

                <div className="mt-4">
                  <NavigationMenuLink asChild>
                    <Link
                      href="/editorial"
                      className="inline-flex items-center text-sm font-medium underline underline-offset-4 hover:opacity-80"
                    >
                      View all setups →
                    </Link>
                  </NavigationMenuLink>
                </div>
              </div>

              {/* Picks */}
              {p1 ? <PickCard pick={p1} /> : <div />}
              {p2 ? <PickCard pick={p2} /> : <div />}
              {p3 ? <PickCard pick={p3} /> : <div />}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Shop */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/shop">Shop</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
