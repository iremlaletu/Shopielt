import Link from "next/link";
import Image from "next/image";
import { getWixServerClient } from "@/lib/wix-client.server";
import ShoppingCartButton from "./ShoppingCartButton";
import UserButton from "@/components/UserButton";
import { getLoggedInMember } from "@/wix-api/members";
import { getCart } from "@/wix-api/cart";

export default async function Navbar() {
  const wixClient = getWixServerClient();
  const [cart, loggedInMember] = await Promise.all([
    getCart(await wixClient),
    getLoggedInMember(await wixClient),
  ]);

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
        <div className="flex items-center justify-center gap-4">
          <UserButton loggedInMember={loggedInMember} />
          <ShoppingCartButton initialData={cart} />
        </div>
      </div>
    </header>
  );
}

// is server component
