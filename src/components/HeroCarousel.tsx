"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export const items = [
  {
    id: 1,
    title: "Winter Warmers",
    discountPct: 60,
    img: "https://images.pexels.com/photos/7026525/pexels-photo-7026525.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "/",
  },
  {
    id: 2,
    title: "Summer Refresh",
    discountPct: 50,
    img: "https://images.pexels.com/photos/33387429/pexels-photo-33387429.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "/",
  },
  {
    id: 3,
    title: "Spring Reset",
    discountPct: 40,
    img: "https://images.pexels.com/photos/6220663/pexels-photo-6220663.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "/",
  },
];

export default function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div>
      <Carousel
        plugins={[
          Autoplay({
            delay: 6000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
        setApi={setApi}
        className="w-full"
        opts={{ loop: true, align: "start" }}
      >
        <CarouselContent>
          {items.map((s, idx) => (
            <CarouselItem key={s.id}>
              <div className="group relative w-full">
                {/* Background image */}
                <div className="relative w-full h-[56vh] min-h-[420px] ">
                  <Image
                    src={s.img}
                    alt={s.title}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 640px) 100vw, 90vw"
                    className="object-cover object-[50%_30%] transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  
                
                </div>

                {/* Content layer */}
                <div className="absolute inset-0 flex items-end">
                  <div className="w-full px-4 pb-4 sm:px-12">
                    {/* BLUR CARD  */}
                    <div className="max-w-lg space-y-3 rounded-2xl bg-transparent p-6 shadow-2xl backdrop-blur-sm supports-[backdrop-filter]:bg-transparent">
                      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        <span className="mr-1 text-primary text-lg">•</span> New season
                      </span>

                      {/* Title */}
                      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {s.title}
                      </h2>

                      {/* Subtitle */}
                      <p className="text-sm leading-relaxed text-primary-foreground">
                        Refresh your wardrobe with limited-time deals up to {s.discountPct}% off on the season’s most-loved picks.
                      </p>

                      {/* CTAs */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Link href={s.url} aria-label={`View ${s.title} offer`}>
                          <Button size="lg" className="h-10 cursor-pointer">
                            Shop Now
                          </Button>
                        </Link>
                        <Link href="/collections" aria-label="Browse all collections">
                          <Button size="lg" variant="secondary" className="h-10 cursor-pointer">
                            View Collection
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrows */}
        <div className="hidden sm:block">
          <CarouselPrevious className="left-3" />
          <CarouselNext className="right-3" />
        </div>

        {/* Pagination Dots */}
        <div className="mt-3 flex w-full items-center justify-center gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => api?.scrollTo(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                current === i ? "w-6 bg-foreground" : "w-2.5 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}

