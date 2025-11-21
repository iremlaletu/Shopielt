import Link from "next/link";
import Image from "next/image";
import { getWixServerClient } from "@/lib/wix-client.server";
import ShoppingCartButton from "./ShoppingCartButton";
import UserButton from "@/components/UserButton";
import { getLoggedInMember } from "@/wix-api/members";
import { getCart } from "@/wix-api/cart";
import { getCollections } from "@/wix-api/collections";
import MainNavigation from "./MainNavigation";

export default async function Navbar() {

  const wixClient = getWixServerClient();
  
  const [cart, loggedInMember, collections,] = await Promise.all([
    getCart(await wixClient),
    getLoggedInMember(await wixClient),
    getCollections(await wixClient),
  ]);

  return (
    <header className="bg-background shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 p-4">
        <div className="flex flex-wrap items-center gap-5">
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
          <MainNavigation collections={collections} className="hidden lg:flex" />
        </div>
        <div className="flex items-center justify-center gap-4">
          <UserButton loggedInMember={loggedInMember} />
          <ShoppingCartButton initialData={cart} />
        </div>
      </div>
    </header>
  );
}

// is server component
