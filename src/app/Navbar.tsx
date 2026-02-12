import Link from "next/link";
import Image from "next/image";
import { getWixServerClient } from "@/lib/wix-client.server";
import ShoppingCartButton from "./ShoppingCartButton";
import UserButton from "@/components/UserButton";
import { getLoggedInMember } from "@/wix-api/members";
import { getCart } from "@/wix-api/cart";
import { getCollections } from "@/wix-api/collections";
import MainNavigation from "./MainNavigation";
import SearchFields from "@/components/SearchFields";
import MobileMenu from "./MobileMenu";
import { Suspense } from "react";
import { getEditorsPicks} from "@/wix-api/editorpicks";

export default async function Navbar() {

  const wixClient = await getWixServerClient();
  
  const [cart, loggedInMember, collections, editorsPicks] = await Promise.all([
    getCart(wixClient),
    getLoggedInMember(wixClient),
    getCollections(wixClient),
    getEditorsPicks(wixClient)
  ]);

  return (
    <header className="bg-background border-b border-border">
      <div className="mx-auto flex items-center justify-between gap-5 py-4 px-6 sm:px-14">
        <Suspense>
          <MobileMenu
            collections={collections}
            loggedInMember={loggedInMember}
          />
        </Suspense>
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
          <MainNavigation editorsPicks={editorsPicks} className="hidden lg:flex" />
        </div>
        <SearchFields className="max-w-96 hidden lg:inline " />
        <div className="flex items-center justify-center gap-4">
          <UserButton loggedInMember={loggedInMember} className="hidden lg:inline-flex" />
          <ShoppingCartButton initialData={cart} />
        </div>
      </div>
    </header>
  );
}

// Why wrapped MobileMenu with Suspense? https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout