import HeroCarousel from "@/components/HeroCarousel";
import { delay } from "@/lib/utils";

export default function Home() {
  return (
    <>
      <HeroCarousel />

      <FeaturedProducts />
    </>
  );
}

async function FeaturedProducts() {
  await delay(4000);
  return <div className="mt-12">Featured Products</div>;
}
