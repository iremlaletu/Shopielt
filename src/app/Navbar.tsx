
import Link from "next/link";
import Image from "next/image";
import getCart from "@/wix-api/cart";



export default async function Navbar() {
  const cart = await getCart();
  const totalQuantity =
    cart?.lineItems?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
  return (
    <header className="bg-background shadow-sm">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between gap-5">
        <Link href="/" className="flex items-center">
        <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
          />
        </Link>
        {totalQuantity} in  cart
      </div>
    </header>
  );
}
