import Link from "next/link";
import Image from "next/image";
import getCart from "@/wix-api/cart";
import { getWixServerClient } from "@/lib/wix-client.server";
import ShoppingCartButton from "./ShoppingCartButton";

export default async function Navbar() {
  const cart = await getCart(await getWixServerClient());

  return (
    <header className="bg-background shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 p-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={48}
            className="h-auto w-24"
            priority
          />
        </Link>
        <ShoppingCartButton initialData={cart} />
      </div>
    </header>
  );
}
