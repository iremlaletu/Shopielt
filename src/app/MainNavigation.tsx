"use client";

import * as React from "react";
import Link from "next/link";
import { BadgePercent, CircleCheck, CircleHelp } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { collections } from "@wix/stores";
import { useState } from "react";

type Props = {
  className?: string;
  collections: collections.Collection[];
};

export default function MainNavigation({ className, collections }: Props) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  return (
    <NavigationMenu className={`${className} z-10`} viewport={false}>
      <NavigationMenuList>
        {/* Categories */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-2 p-2 md:w-[500px] lg:w-[720px] lg:grid-cols-[1fr_.8fr]">
              {/* Left: Collections */}
              <ul className="flex flex-col gap-1">
                {collections.map((collection) => (
                  <li
                    key={collection._id}
                    onMouseEnter={() =>
                      setActiveImage(
                        collection.media?.mainMedia?.image?.url || null,
                      )
                    }
                    onMouseLeave={() => setActiveImage(null)}
                  >
                    <NavigationMenuLink asChild>
                      <Link
                        className="hover:bg-accent hover:text-accent-foreground flex w-full flex-col gap-1 rounded-md p-2 transition-colors"
                        href={`/collections/${collection.slug}`}
                      >
                        <span className="text-sm font-medium">
                          {collection.name}
                        </span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>

              {/* Right: Dynamic Promo */}
              <div
                className="relative flex h-full w-full flex-col justify-end overflow-hidden rounded-md p-6 text-white transition-all duration-300"
                style={{
                  backgroundImage: activeImage
                    ? `url(${activeImage})`
                    : "linear-gradient(to bottom, var(--muted), var(--muted))",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />

                <div className="relative z-10">
                  <div className="text-xs tracking-wide uppercase opacity-80">
                    Featured
                  </div>
                  <div className="mt-2 mb-1 text-lg font-semibold">
                    Season Sale
                  </div>
                  <p className="text-sm leading-tight opacity-90">
                    Dont miss out on great deals on popular products.
                  </p>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* New Arrivals */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/shop">Shop</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Sale */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="gap-2">
            <BadgePercent className="size-4" />
            Sale
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[260px] gap-2 p-2">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/" className="hover:bg-accent rounded-md p-2">
                    All Sales
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    href="/"
                    className="hover:bg-accent rounded-md p-2"
                  >
                    Flash Deals
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    href="/"
                    className="hover:bg-accent rounded-md p-2"
                  >
                    Last Chance
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Help */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Help</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-3 p-2">
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    href="/faq"
                    className="hover:bg-accent flex flex-row items-start gap-2 rounded-md p-2"
                  >
                    <CircleHelp className="mt-0.5 size-4" />
                    <div>
                      <div className="text-sm font-medium">FAQ & Support</div>
                      <p className="text-muted-foreground text-xs">
                        Shipping, returns, and payment questions
                      </p>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    href="/returns"
                    className="hover:bg-accent flex flex-row items-start gap-2 rounded-md p-2"
                  >
                    <CircleCheck className="mt-0.5 size-4" />
                    <div>
                      <div className="text-sm font-medium">Easy Returns</div>
                      <p className="text-muted-foreground text-xs">
                        Free returns within 30 days
                      </p>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
